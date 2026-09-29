import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { database, hasPermission, readSession, sameOrigin, validCsrf } from "@/lib/identity";
import { content, hash, mimeOf, UUID, localeProse, type LocaleContent } from "@/lib/cms";

export const runtime = "nodejs";
type Body = Record<string, unknown>;
const KEY = /^[a-z0-9][a-z0-9-]{1,79}$/;
const settingKeys = ["site_name_en","site_name_bn","contact_email","robots_enabled"];
function json(data: object, status = 200) { return NextResponse.json(data, { status, headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" } }); }
function bad(code: string, status = 400) { return json({ code }, status); }
async function bounded(request: NextRequest, limit: number): Promise<Buffer | null> {
  const reader = request.body?.getReader(); if (!reader) return null;
  const chunks: Uint8Array[] = []; let size = 0;
  while (true) { const { done, value } = await reader.read(); if (done) break;
    size += value.length; if (size > limit) { await reader.cancel(); return null; } chunks.push(value); }
  return Buffer.concat(chunks);
}
async function bodyOf(request: NextRequest): Promise<Body | null> {
  if (!request.headers.get("content-type")?.startsWith("application/json")) return null;
  const raw = await bounded(request, 65536); if (!raw) return null;
  try { const body: unknown = JSON.parse(raw.toString("utf8"));
    return body && typeof body === "object" && !Array.isArray(body) ? body as Body : null;
  } catch { return null; }
}
function only(body: Body, keys: string[]) { return Object.keys(body).every((key) => keys.includes(key)); }
function string(value: unknown, max: number): value is string { return typeof value === "string" && value.trim().length > 0 && value.length <= max; }
function path(params: { path: string[] }) { return params.path.join("/"); }

export async function GET(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const part = path(await params); const db = database();
  try {
    if (/^media\/[0-9a-f-]{36}\/content$/.test(part)) {
      const id = part.split("/")[1]; if (!UUID.test(id)) return bad("NOT_FOUND",404);
      const rows = await db`SELECT bytes,mime_type,public FROM cms_media WHERE id=${id}`;
      if (!rows.length) return bad("NOT_FOUND",404);
      if (!rows[0].public) { const session = await readSession(db, request);
        if (!session || !await hasPermission(db,session.userId,"media.read")) return bad("FORBIDDEN",403); }
      return new NextResponse(new Uint8Array(rows[0].bytes), { headers: { "Content-Type": rows[0].mime_type,
        "Content-Disposition": "inline", "X-Content-Type-Options": "nosniff",
        "Cache-Control": rows[0].public ? "public, max-age=3600" : "no-store",
        "Content-Security-Policy": "default-src 'none'; sandbox" } });
    }
    const session = await readSession(db, request); if (!session) return bad("UNAUTHENTICATED",401);
    const allowed = async (perm: string) => await hasPermission(db,session.userId,perm);
    if (part === "pages" && await allowed("pages.read")) {
      const rows = await db`SELECT p.id,p.page_key,p.kind,p.state,p.published_revision_id,
        (SELECT max(revision_no) FROM cms_revision WHERE page_id=p.id) AS latest_revision
        FROM cms_page p ORDER BY p.updated_at DESC LIMIT 100`;
      return json({ pages: rows });
    }
    if (/^pages\/[0-9a-f-]{36}$/.test(part) && await allowed("pages.read")) {
      const id=part.split("/")[1]; if (!UUID.test(id)) return bad("NOT_FOUND",404);
      const pages=await db`SELECT id,page_key,kind,state,published_revision_id FROM cms_page WHERE id=${id}`;
      if (!pages.length) return bad("NOT_FOUND",404);
      const revisions=await db`SELECT r.id,r.revision_no,r.en,r.bn,r.created_by,r.created_at,
        (SELECT decision FROM cms_review WHERE revision_id=r.id ORDER BY created_at DESC,id DESC LIMIT 1) AS review
        FROM cms_revision r WHERE r.page_id=${id} ORDER BY r.revision_no DESC LIMIT 50`;
      return json({ page: pages[0], revisions });
    }
    if (/^preview\/[0-9a-f-]{36}$/.test(part) && await allowed("pages.read")) {
      const id=part.split("/")[1]; if (!UUID.test(id)) return bad("NOT_FOUND",404);
      const rid=request.nextUrl.searchParams.get("revision");
      if (rid && !UUID.test(rid)) return bad("INVALID_REVISION");
      const rows=rid ? await db`SELECT r.id,r.en,r.bn,p.page_key FROM cms_revision r JOIN cms_page p ON p.id=r.page_id WHERE p.id=${id} AND r.id=${rid}`
        : await db`SELECT r.id,r.en,r.bn,p.page_key FROM cms_revision r JOIN cms_page p ON p.id=r.page_id WHERE p.id=${id} ORDER BY r.revision_no DESC LIMIT 1`;
      if (!rows.length) return bad("NOT_FOUND",404);
      return json({ preview: rows[0], watermark: "STAFF PREVIEW — UNPUBLISHED" });
    }
    if (part === "navigation" && await allowed("pages.read")) return json({ items: await db`SELECT n.id,n.slot,n.position,n.page_id,n.label_en,n.label_bn,p.state FROM cms_navigation n JOIN cms_page p ON p.id=n.page_id ORDER BY n.slot,n.position`, pages: await db`SELECT id,page_key FROM cms_page WHERE state='published' ORDER BY page_key` });
    if (part === "media" && await allowed("media.read")) return json({ assets: await db`SELECT id,filename,mime_type,byte_length,sha256,public,rights_reference,alt_en,alt_bn,created_at FROM cms_media ORDER BY created_at DESC LIMIT 100` });
    if (part === "seo" && await allowed("pages.read")) return json({ pages: await db`SELECT p.id,p.page_key,p.state,r.en->>'seoTitle' AS seo_title_en,r.bn->>'seoTitle' AS seo_title_bn,r.en->>'slug' AS slug_en,r.bn->>'slug' AS slug_bn FROM cms_page p LEFT JOIN cms_revision r ON r.id=p.published_revision_id ORDER BY p.page_key`, redirects: await db`SELECT id,locale,source_path,target_page_id FROM cms_redirect ORDER BY locale,source_path` });
    if (part === "settings" && await allowed("settings.site")) return json({ settings: await db`SELECT key,value,updated_at FROM cms_setting ORDER BY key` });
    return bad("FORBIDDEN",403);
  } finally { await db.end(); }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const part=path(await params); const requestId=randomUUID();
  if (!sameOrigin(request)) return bad("ORIGIN_REQUIRED",403);
  const db=database();
  try {
    const session=await readSession(db,request); if (!session) return bad("UNAUTHENTICATED",401);
    if (!validCsrf(request,session)) return bad("CSRF_REQUIRED",403);
    const allowed=async (perm: string) => await hasPermission(db,session.userId,perm);
    if (/^media\/[0-9a-f-]{36}\/publish$/.test(part)) {
      if (!await allowed("pages.publish")) return bad("FORBIDDEN",403);
      const id=part.split("/")[1]; if (!UUID.test(id)) return bad("NOT_FOUND",404);
      const result=await db.begin(async tx=>{ const rows=await tx`SELECT id,uploaded_by,rights_reference,alt_en,alt_bn FROM cms_media WHERE id=${id} FOR UPDATE`;
        if (!rows.length) return "NOT_FOUND";
        if (rows[0].uploaded_by===session.userId || !rows[0].rights_reference || !rows[0].alt_en || !rows[0].alt_bn) return "INDEPENDENT_APPROVAL_REQUIRED";
        await tx`UPDATE cms_media SET public=true WHERE id=${id}`;
        await tx`INSERT INTO identity_audit(actor_user_id,action,outcome,request_id,metadata) VALUES (${session.userId},'cms.media_publish','success',${requestId},${tx.json({media_id:id})})`;
        return "OK"; });
      return result==="OK"?json({status:"public"}):bad(result,result==="NOT_FOUND"?404:409);
    }
    if (part === "media") {
      if (!await allowed("media.write")) return bad("FORBIDDEN",403);
      const raw=await bounded(request, 6*1024*1024); if (!raw) return bad("FILE_TOO_LARGE",413);
      const form=await new Request(request.url,{method:"POST",headers:{"content-type":request.headers.get("content-type") ?? ""},body:new Uint8Array(raw)}).formData().catch(()=>null);
      const file=form?.get("file"), rights=form?.get("rights_reference"), altEn=form?.get("alt_en"), altBn=form?.get("alt_bn");
      if (!(file instanceof File) || !string(rights,500) || !string(altEn,200) || !string(altBn,200) || !localeProse(altEn as string,"en") || !localeProse(altBn as string,"bn") || file.size > 5242880 || file.size===0) return bad("INVALID_MEDIA");
      const rightsText=rights as string, altEnText=altEn as string, altBnText=altBn as string;
      const bytes=Buffer.from(await file.arrayBuffer()), mime=mimeOf(bytes);
      if (!mime || mime !== file.type || !/^[-.a-zA-Z0-9_]{1,120}$/.test(file.name)) return bad("INVALID_MIME");
      const id=await db.begin(async tx=>{ const rows=await tx`INSERT INTO cms_media(filename,mime_type,bytes,byte_length,sha256,rights_reference,alt_en,alt_bn,uploaded_by)
        VALUES (${file.name},${mime},${bytes},${bytes.length},${hash(bytes)},${rightsText},${altEnText},${altBnText},${session.userId}) RETURNING id`;
        await tx`INSERT INTO identity_audit(actor_user_id,action,outcome,request_id,metadata) VALUES (${session.userId},'cms.media_upload','success',${requestId},${tx.json({ media_id: rows[0].id })})`;
        return rows[0].id as string; });
      return json({ id },201);
    }
    const body=await bodyOf(request); if (!body) return bad("INVALID_BODY");
    if (part === "pages") {
      if (!await allowed("pages.write")) return bad("FORBIDDEN",403);
      if (!only(body,["page_key","kind","category","en","bn"]) || typeof body.page_key !== "string" || !KEY.test(body.page_key) || !["page","landing","service"].includes(String(body.kind)) ||
        (body.kind === "service" && (typeof body.category !== "string" || !KEY.test(body.category))) ||
        (body.kind !== "service" && body.category !== undefined) || !content(body.en,false,"en") || !content(body.bn,false,"bn")) return bad("INVALID_PAGE");
      const en=body.en as LocaleContent, bn=body.bn as LocaleContent;
      try { const id=await db.begin(async tx=>{ const pages=await tx`INSERT INTO cms_page(page_key,kind,created_by) VALUES (${body.page_key as string},${body.kind as string},${session.userId}) RETURNING id`;
        await tx`INSERT INTO cms_revision(page_id,revision_no,en,bn,created_by) VALUES (${pages[0].id},1,${tx.json(en)},${tx.json(bn)},${session.userId})`;
        if (body.kind === "service") await tx`INSERT INTO catalog_service(page_id,category) VALUES (${pages[0].id},${body.category as string})`;
        await tx`INSERT INTO identity_audit(actor_user_id,action,outcome,request_id,metadata) VALUES (${session.userId},'cms.page_create','success',${requestId},${tx.json({ page_id: pages[0].id })})`;
        return pages[0].id as string; }); return json({id},201);
      } catch (error) { if (typeof error === "object" && error && "code" in error && error.code === "23505") return bad("PAGE_KEY_IN_USE",409); throw error; }
    }
    const match=/^pages\/([0-9a-f-]{36})\/(revisions|reviews|publish|rollback|archive)$/.exec(part);
    if (match) {
      const [,id,action]=match; if (!UUID.test(id)) return bad("NOT_FOUND",404);
      const permission=action==="revisions"?"pages.write":action==="reviews"?"pages.review":"pages.publish";
      if (!await allowed(permission)) return bad("FORBIDDEN",403);
      if (action==="revisions") {
        if (!only(body,["base_revision_id","en","bn"]) || !UUID.test(String(body.base_revision_id)) || !content(body.en,false,"en") || !content(body.bn,false,"bn")) return bad("INVALID_REVISION");
        const en=body.en as LocaleContent, bn=body.bn as LocaleContent;
        const result=await db.begin(async tx=>{ await tx`SELECT id FROM cms_page WHERE id=${id} AND state<>'archived' FOR UPDATE`;
          const latest=await tx`SELECT id,revision_no FROM cms_revision WHERE page_id=${id} ORDER BY revision_no DESC LIMIT 1`;
          if (!latest.length) return {error:"NOT_FOUND"}; if (latest[0].id!==body.base_revision_id) return {error:"REVISION_CONFLICT"};
          const rows=await tx`INSERT INTO cms_revision(page_id,revision_no,en,bn,created_by) VALUES (${id},${Number(latest[0].revision_no)+1},${tx.json(en)},${tx.json(bn)},${session.userId}) RETURNING id`;
          await tx`UPDATE cms_page SET updated_at=now() WHERE id=${id}`;
          await tx`INSERT INTO identity_audit(actor_user_id,action,outcome,request_id,metadata) VALUES (${session.userId},'cms.revision_create','success',${requestId},${tx.json({page_id:id,revision_id:rows[0].id})})`;
          return {id:rows[0].id}; });
        return "error" in result ? bad(result.error as string,result.error==="NOT_FOUND"?404:409) : json(result,201);
      }
      if (action==="reviews") {
        if (!only(body,["revision_id","decision","note"]) || !UUID.test(String(body.revision_id)) || !["approved","rejected"].includes(String(body.decision)) || !string(body.note,500)) return bad("INVALID_REVIEW");
        const result=await db.begin(async tx=>{ await tx`SELECT id FROM cms_page WHERE id=${id} AND state<>'archived' FOR UPDATE`;
          const revision=await tx`SELECT id,created_by,en,bn FROM cms_revision WHERE page_id=${id} AND id=${body.revision_id as string}`;
          if (!revision.length) return "NOT_FOUND";
          if (revision[0].created_by===session.userId) return "SELF_REVIEW_DENIED";
          if (body.decision==="approved" && (!content(revision[0].en,true,"en") || !content(revision[0].bn,true,"bn"))) return "LOCALE_INCOMPLETE";
          await tx`INSERT INTO cms_review(revision_id,reviewer_id,decision,note) VALUES (${revision[0].id},${session.userId},${body.decision as string},${body.note as string})`;
          await tx`INSERT INTO identity_audit(actor_user_id,action,outcome,request_id,metadata) VALUES (${session.userId},'cms.review','success',${requestId},${tx.json({page_id:id,revision_id:revision[0].id,decision:body.decision as string})})`;
          return "OK"; }); return result==="OK"?json({status:"recorded"}):bad(result,result==="NOT_FOUND"?404:409);
      }
      if (action==="publish") {
        if (!only(body,["revision_id"]) || !UUID.test(String(body.revision_id))) return bad("INVALID_REVISION");
        const result=await db.begin(async tx=>{ const pages=await tx`SELECT id,state FROM cms_page WHERE id=${id} FOR UPDATE`;
          if (!pages.length || pages[0].state==="archived") return "NOT_FOUND";
          const latest=await tx`SELECT id,created_by,en,bn FROM cms_revision WHERE page_id=${id} ORDER BY revision_no DESC LIMIT 1`;
          if (!latest.length || latest[0].id!==body.revision_id) return "REVISION_CONFLICT";
          const review=await tx`SELECT decision,reviewer_id FROM cms_review WHERE revision_id=${latest[0].id} ORDER BY created_at DESC,id DESC LIMIT 1`;
          if (!review.length || review[0].decision!=="approved" || review[0].reviewer_id===session.userId || latest[0].created_by===session.userId) return "APPROVAL_REQUIRED";
          if (!content(latest[0].en,true,"en") || !content(latest[0].bn,true,"bn")) return "LOCALE_INCOMPLETE";
          const mediaIds=new Set<string>();
          for (const locale of ["en","bn"] as const) for (const section of (latest[0][locale] as {sections:Array<{mediaId?:string}>}).sections)
            if (section.mediaId) mediaIds.add(section.mediaId);
          for (const mediaId of mediaIds) { const asset=await tx`SELECT 1 FROM cms_media WHERE id=${mediaId} AND public=true`;
            if (!asset.length) return "MEDIA_NOT_PUBLIC"; }
          for (const locale of ["en","bn"] as const) { const slug=(latest[0][locale] as {slug:string}).slug;
            const clash=locale==="en" ? await tx`SELECT 1 FROM cms_page p JOIN cms_revision r ON r.id=p.published_revision_id
              WHERE p.id<>${id} AND p.state='published' AND r.en->>'slug'=${slug} LIMIT 1`
              : await tx`SELECT 1 FROM cms_page p JOIN cms_revision r ON r.id=p.published_revision_id
              WHERE p.id<>${id} AND p.state='published' AND r.bn->>'slug'=${slug} LIMIT 1`;
            if (clash.length) return "SLUG_IN_USE"; }
          await tx`UPDATE cms_page SET published_revision_id=${latest[0].id},state='published',updated_at=now() WHERE id=${id}`;
          await tx`INSERT INTO cms_publication(page_id,revision_id,action,actor_id) VALUES (${id},${latest[0].id},'publish',${session.userId})`;
          await tx`INSERT INTO identity_audit(actor_user_id,action,outcome,request_id,metadata) VALUES (${session.userId},'cms.publish','success',${requestId},${tx.json({page_id:id,revision_id:latest[0].id})})`;
          return "OK"; }); return result==="OK"?json({status:"published"}):bad(result,result==="NOT_FOUND"?404:409);
      }
      if (action==="rollback") {
        if (!only(body,["revision_id"]) || !UUID.test(String(body.revision_id))) return bad("INVALID_REVISION");
        const result=await db.begin(async tx=>{ const pages=await tx`SELECT id FROM cms_page WHERE id=${id} AND state<>'archived' FOR UPDATE`;
          if (!pages.length) return {error:"NOT_FOUND"};
          const old=await tx`SELECT en,bn FROM cms_revision WHERE page_id=${id} AND id=${body.revision_id as string}`;
          if (!old.length) return {error:"NOT_FOUND"};
          const latest=await tx`SELECT revision_no FROM cms_revision WHERE page_id=${id} ORDER BY revision_no DESC LIMIT 1`;
          const rows=await tx`INSERT INTO cms_revision(page_id,revision_no,en,bn,created_by) VALUES (${id},${Number(latest[0].revision_no)+1},${tx.json(old[0].en)},${tx.json(old[0].bn)},${session.userId}) RETURNING id`;
          await tx`INSERT INTO identity_audit(actor_user_id,action,outcome,request_id,metadata) VALUES (${session.userId},'cms.rollback_copy','success',${requestId},${tx.json({page_id:id,source_revision_id:body.revision_id as string,new_revision_id:rows[0].id})})`;
          return {id:rows[0].id}; }); return "error" in result?bad(result.error as string,404):json(result,201);
      }
      if (!only(body,[])) return bad("INVALID_BODY");
      const result=await db.begin(async tx=>{ const pages=await tx`SELECT id FROM cms_page WHERE id=${id} FOR UPDATE`;
        if (!pages.length) return false;
        await tx`DELETE FROM cms_navigation WHERE page_id=${id}`;
        await tx`DELETE FROM cms_redirect WHERE target_page_id=${id}`;
        await tx`UPDATE cms_page SET state='archived',published_revision_id=NULL,updated_at=now() WHERE id=${id}`;
        await tx`INSERT INTO cms_publication(page_id,action,actor_id) VALUES (${id},'archive',${session.userId})`;
        await tx`INSERT INTO identity_audit(actor_user_id,action,outcome,request_id,metadata) VALUES (${session.userId},'cms.archive','success',${requestId},${tx.json({page_id:id})})`;
        return true; }); return result?json({status:"archived"}):bad("NOT_FOUND",404);
    }
    if (part==="navigation") {
      if (!await allowed("navigation.write")) return bad("FORBIDDEN",403);
      if (!only(body,["slot","position","page_id","label_en","label_bn"]) || !["header","footer"].includes(String(body.slot)) || !Number.isInteger(body.position) || Number(body.position)<0 || Number(body.position)>99 || !UUID.test(String(body.page_id)) || !string(body.label_en,80) || !string(body.label_bn,80) || !localeProse(body.label_en as string,"en") || !localeProse(body.label_bn as string,"bn")) return bad("INVALID_NAVIGATION");
      const pages=await db`SELECT id FROM cms_page WHERE id=${body.page_id as string} AND state='published'`;
      if (!pages.length) return bad("PAGE_NOT_PUBLISHED",409);
      try { const rows=await db.begin(async tx=>{ const item=await tx`INSERT INTO cms_navigation(slot,position,page_id,label_en,label_bn,updated_by) VALUES (${body.slot as string},${body.position as number},${body.page_id as string},${body.label_en as string},${body.label_bn as string},${session.userId}) RETURNING id`;
        await tx`INSERT INTO identity_audit(actor_user_id,action,outcome,request_id,metadata) VALUES (${session.userId},'cms.navigation_add','success',${requestId},${tx.json({navigation_id:item[0].id})})`; return item[0]; }); return json(rows,201);
      } catch(error) { if (typeof error==="object" && error && "code" in error && error.code==="23505") return bad("NAVIGATION_CONFLICT",409); throw error; }
    }
    if (part==="seo") {
      if (!await allowed("seo.write")) return bad("FORBIDDEN",403);
      if (!only(body,["locale","source_path","target_page_id"]) || !["en","bn"].includes(String(body.locale)) || typeof body.source_path!=="string" || !/^\/[a-z0-9/-]{1,200}$/.test(body.source_path) || !UUID.test(String(body.target_page_id))) return bad("INVALID_REDIRECT");
      const target=await db`SELECT id FROM cms_page WHERE id=${body.target_page_id as string} AND state='published'`; if (!target.length) return bad("PAGE_NOT_PUBLISHED",409);
      const rows=await db.begin(async tx=>{ const item=await tx`INSERT INTO cms_redirect(locale,source_path,target_page_id,updated_by) VALUES (${body.locale as string},${body.source_path as string},${body.target_page_id as string},${session.userId}) ON CONFLICT(locale,source_path) DO UPDATE SET target_page_id=EXCLUDED.target_page_id,updated_by=EXCLUDED.updated_by,updated_at=now() RETURNING id`;
        await tx`INSERT INTO identity_audit(actor_user_id,action,outcome,request_id,metadata) VALUES (${session.userId},'cms.redirect_set','success',${requestId},${tx.json({redirect_id:item[0].id})})`; return item[0]; }); return json(rows);
    }
    if (part==="settings") {
      if (!await allowed("settings.site")) return bad("FORBIDDEN",403);
      if (!only(body,["key","value"]) || !settingKeys.includes(String(body.key)) || typeof body.value!=="string" || body.value.length>200) return bad("INVALID_SETTING");
      if (body.key==="robots_enabled" && !["true","false"].includes(body.value)) return bad("INVALID_SETTING");
      if (body.key==="contact_email" && body.value!=="" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.value)) return bad("INVALID_SETTING");
      if (body.key==="site_name_en" && !localeProse(body.value,"en")) return bad("INVALID_SETTING");
      if (body.key==="site_name_bn" && !localeProse(body.value,"bn")) return bad("INVALID_SETTING");
      const rows=await db.begin(async tx=>{ const item=await tx`INSERT INTO cms_setting(key,value,updated_by) VALUES (${body.key as string},${body.value as string},${session.userId}) ON CONFLICT(key) DO UPDATE SET value=EXCLUDED.value,updated_by=EXCLUDED.updated_by,updated_at=now() RETURNING key`;
        await tx`INSERT INTO identity_audit(actor_user_id,action,outcome,request_id,metadata) VALUES (${session.userId},'cms.setting_set','success',${requestId},${tx.json({key:item[0].key})})`; return item[0]; }); return json(rows);
    }
    return bad("NOT_FOUND",404);
  } finally { await db.end(); }
}
