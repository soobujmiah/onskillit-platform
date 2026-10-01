"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { SiteContentAdmin } from "@/components/cms/SiteContentAdmin";

type Text = Record<string,string>;
type LocaleContent = { title:string; slug:string; description:string; seoTitle:string; seoDescription:string;
  sections:Array<{type:"hero"|"text"|"cta"|"profile";heading:string;body:string;role?:string;source:string;href?:string;mediaId?:string;skills?:string[];links?:Array<{label:string;url:string}>;relationship?:string;status?:"active"|"hidden"}> };
type Revision = {id:string;revision_no:number;en:LocaleContent;bn:LocaleContent;created_by:string;review:string|null};
type Page = {id:string;page_key:string;kind:string;state:string;published_revision_id:string|null;latest_revision:number;title_en?:string|null;title_bn?:string|null};
type Media = {id:string;filename:string;mime_type:string;byte_length:number;public:boolean;rights_reference:string;alt_en:string;alt_bn:string};
const blank=():LocaleContent=>({title:"",slug:"",description:"",seoTitle:"",seoDescription:"",sections:[]});
function Field({label,value,onChange,multiline=false}:{label:string;value:string;onChange:(value:string)=>void;multiline?:boolean}) {
  return <label className="cms-field"><span>{label}</span>{multiline?<textarea value={value} onChange={e=>onChange(e.target.value)} rows={4}/>:<input value={value} onChange={e=>onChange(e.target.value)}/>}</label>;
}
export function CmsWorkspace({locale,section,id,t,title}:{locale:string;section:"pages"|"editor"|"navigation"|"media"|"seo"|"settings";id?:string;t:Text;title:string}) {
  const router=useRouter();
  const [data,setData]=useState<Record<string,unknown>>({});
  const [loading,setLoading]=useState(true);
  const [loadFailed,setLoadFailed]=useState(false);
  const [busy,setBusy]=useState(false); const [message,setMessage]=useState("");
  const [en,setEn]=useState<LocaleContent>(blank); const [bn,setBn]=useState<LocaleContent>(blank);
  const [kind,setKind]=useState("page");
  const [category,setCategory]=useState("");
  const [note,setNote]=useState(""); const [preview,setPreview]=useState<Record<string,unknown>|null>(null);
  const [form,setForm]=useState<Record<string,string>>({});
  const settings=(data.settings??[]) as Array<{key:string;value:string}>;
  const settingValue=(key:string)=>settings.find(item=>item.key===key)?.value??"";
  const settingDraft=form.value??settingValue("robots_enabled")??"false";
  const endpoint=section==="editor"?`pages/${id}`:section;
  const reload=useCallback(async()=>{
    const response=await fetch(`/api/v1/cms/${endpoint}`,{credentials:"same-origin",cache:"no-store"});
    if (!response.ok) {setMessage(t.error);return;}
    const next=await response.json() as Record<string,unknown>;setData(next);
    if (section==="editor") { const revisions=next.revisions as Revision[];
      if (revisions?.length) {setEn(revisions[0].en);setBn(revisions[0].bn);} }
  },[endpoint,section,t.error]);
  useEffect(()=>{let active=true;
    void fetch(`/api/v1/cms/${endpoint}`,{credentials:"same-origin",cache:"no-store"})
      .then(response=>{if(!response.ok)throw new Error("CMS_LOAD_FAILED");return response.json();}).then((next:Record<string,unknown>)=>{if(!active)return;setData(next);setLoading(false);setLoadFailed(false);
        if(section==="editor"){const revisions=next.revisions as Revision[];if(revisions?.length){setEn(revisions[0].en);setBn(revisions[0].bn);}}})
      .catch(()=>{if(active){setMessage(t.error);setLoading(false);setLoadFailed(true);}});
    return ()=>{active=false;};
  },[endpoint,section,t.error]);
  async function action(path:string,body:object|FormData) {
    setBusy(true);setMessage("");
    try { const csrf=document.cookie.split("; ").find(x=>x.startsWith("onskillit_csrf="))?.split("=")[1] ?? "";
      const response=await fetch(`/api/v1/cms/${path}`,{method:"POST",credentials:"same-origin",
        headers:{"x-csrf-token":decodeURIComponent(csrf),...(body instanceof FormData?{}:{"content-type":"application/json"})},
        body:body instanceof FormData?body:JSON.stringify(body)});
      const result=await response.json() as {id?:string;code?:string};
      setMessage(response.ok?t.success:(result.code&&t[`error_${result.code}`])||t.error);
      if (response.ok) {await reload(); if(path==="navigation")setForm({}); if (path==="pages" && result.id) router.push(`/${locale}/staff/content/pages/${result.id}`);}
    } catch {setMessage(t.error);} finally {setBusy(false);} }
  function field(name:string,label:string,type="text") {return <label className="cms-field"><span>{label}</span><input type={type} value={form[name]??""} onChange={e=>setForm({...form,[name]:e.target.value})}/></label>;}
  function nextNavigationPosition(slot:string) {return Math.max(-1,...((data.items??[]) as Array<{slot:string;position:number}>).filter(item=>item.slot===slot).map(item=>item.position))+1;}
  function localeEditor(value:LocaleContent,set:(next:LocaleContent)=>void,label:string) {
    const update=(key:keyof LocaleContent,v:string)=>set({...value,[key]:v});
    return <fieldset className="cms-locale"><legend>{label}</legend>
      <Field label={t.title} value={value.title} onChange={v=>update("title",v)}/>
      <Field label={t.slug} value={value.slug} onChange={v=>update("slug",v)}/>
      <p className="cms-help">{t.slugHelp}</p>
      <Field label={t.description} value={value.description} onChange={v=>update("description",v)} multiline/>
      <details className="cms-details"><summary>{t.searchDetails}</summary><Field label={t.seoTitle} value={value.seoTitle} onChange={v=>update("seoTitle",v)}/>
      <Field label={t.seoDescription} value={value.seoDescription} onChange={v=>update("seoDescription",v)} multiline/></details>
      <h3>{t.sections}</h3>{value.sections.map((s,index)=><fieldset key={index} className="cms-section"><legend>{index+1}. {t[s.type==="profile"?"profileSection":s.type]}</legend>
        <label className="cms-field"><span>{t.kind}</span><select value={s.type} onChange={e=>{const sections=[...value.sections];const next={...s,type:e.target.value as typeof s.type};if(next.type==="cta")delete next.mediaId;else delete next.href;if(next.type!=="profile"){delete next.role;delete next.skills;delete next.links;delete next.relationship;delete next.status;}else {next.role??="";}sections[index]=next;set({...value,sections});}}><option value="hero">{t.hero}</option><option value="text">{t.text}</option><option value="cta">{t.cta}</option><option value="profile">{t.profileSection}</option></select></label>
        {s.type==="profile"&&<p className="cms-help">{t.profileHelp}</p>}
        {(["heading",...(s.type==="profile"?["role"]:[]),"body","source",...(s.type==="cta"?["href"]:["mediaId"])] as Array<"heading"|"role"|"body"|"source"|"href"|"mediaId">).map(key=><Field key={key} label={t[key=== "href"?"link":key]} value={s[key]??""} multiline={key==="body"} onChange={v=>{const sections=[...value.sections];const next={...s,[key]:v};if(key==="mediaId"&&!v)delete next.mediaId;if(key==="href"&&!v)delete next.href;sections[index]=next;set({...value,sections});}}/>)}
        {s.type==="profile"&&<>
          <Field label={t.relationship} value={s.relationship??""} onChange={v=>{const sections=[...value.sections];const next:LocaleContent["sections"][number]={...s,relationship:v};if(!v)delete next.relationship;sections[index]=next;set({...value,sections});}}/>
          <Field label={t.skills} value={(s.skills??[]).join("\n")} multiline onChange={v=>{const sections=[...value.sections];const next:LocaleContent["sections"][number]={...s,skills:v.split("\n").map(x=>x.trim()).filter(Boolean)};if(!next.skills?.length)delete next.skills;sections[index]=next;set({...value,sections});}}/>
          <p className="cms-help">{t.skillsHelp}</p>
          <Field label={t.profileLinks} value={(s.links??[]).map(l=>`${l.label} | ${l.url}`).join("\n")} multiline onChange={v=>{const sections=[...value.sections];const links=v.split("\n").map(x=>x.trim()).filter(Boolean).map(line=>{const at=line.lastIndexOf("|");return at<0?{label:line,url:""}:{label:line.slice(0,at).trim(),url:line.slice(at+1).trim()};});const next:LocaleContent["sections"][number]={...s,links};if(!links.length)delete next.links;sections[index]=next;set({...value,sections});}}/>
          <p className="cms-help">{t.profileLinksHelp}</p>
          <label className="cms-field"><span>{t.profileStatus}</span><select value={s.status??"active"} onChange={e=>{const sections=[...value.sections];const next:LocaleContent["sections"][number]={...s,status:e.target.value as "active"|"hidden"};if(next.status==="active")delete next.status;sections[index]=next;set({...value,sections});}}><option value="active">{t.profileActive}</option><option value="hidden">{t.profileHidden}</option></select></label>
          <p className="cms-help">{t.profileOrderHelp}</p>
        </>}
      </fieldset>)}
      <button type="button" onClick={()=>set({...value,sections:[...value.sections,{type:"text",heading:"",body:"",source:""}]})}>{t.addSection}</button>
    </fieldset>;
  }
  const revisions=(data.revisions??[]) as Revision[];
  return <div className="cms-workspace"><header className="cms-heading"><h1>{title}</h1><p className="cms-eyebrow">{t[`${section}Intro`]}</p>
    {section==="editor"&&<Link href={`/${locale}/staff/content/pages`}>{t.back}</Link>}</header>
    {message&&<p role="status" className="cms-message">{message}</p>}
    {loading&&<p role="status" className="cms-help">{t.loading}</p>}
    {section==="pages"&&!loading&&!loadFailed&&<div className="cms-grid"><section className="cms-card"><h2>{t.pages}</h2><p className="cms-help">{t.pagesHelp}</p><ul className="cms-list">{((data.pages??[]) as Page[]).map(p=><li key={p.id}><Link href={`/${locale}/staff/content/pages/${p.id}`}>{(locale==="bn"?p.title_bn:p.title_en)||p.page_key}</Link><span className="cms-badge">{t[p.state]}</span><small>{p.page_key} · {t.latest}: {p.latest_revision}</small></li>)}</ul>{!(data.pages as Page[]|undefined)?.length&&<p>{t.empty}</p>}{!((data.pages??[]) as Page[]).some(p=>p.page_key==="team")&&<div><p className="cms-help">{t.teamPageHelp}</p><button disabled={busy} onClick={()=>void action("pages",{page_key:"team",kind:"page",en:{...blank(),slug:"team"},bn:{...blank(),slug:"team"}})}>{t.createTeamPage}</button></div>}</section>
      <section className="cms-card"><details className="cms-details"><summary>{t.newPage}</summary><p className="cms-help">{t.newPageHelp}</p>{field("page_key",t.pageKey)}<p className="cms-help">{t.pageKeyHelp}</p><label className="cms-field"><span>{t.kind}</span><select value={kind} onChange={e=>setKind(e.target.value)}><option value="page">{t.pages}</option><option value="landing">{t.landing}</option><option value="service">{t.service}</option></select></label>
      {kind === "service" && <Field label={t.category} value={category} onChange={setCategory}/>}
      {localeEditor(en,setEn,t.english)}{localeEditor(bn,setBn,t.bangla)}<button disabled={busy} onClick={()=>void action("pages",{page_key:form.page_key,kind,...(kind === "service" ? {category} : {}),en,bn})}>{t.newPage}</button></details></section></div>}
    {section==="editor"&&!loading&&!loadFailed&&<div className="cms-grid"><section className="cms-card"><h2>{(data.page as Page|undefined)?.page_key??t.editor}</h2><p className="cms-badge">{t[(data.page as Page|undefined)?.state??"draft"]}</p><p className="cms-help">{t.editorSteps}</p>
      {localeEditor(en,setEn,t.english)}{localeEditor(bn,setBn,t.bangla)}
      <p className="cms-help">{t.previewHelp}</p>
      <div className="cms-actions"><button disabled={busy||!revisions.length} onClick={()=>void action(`pages/${id}/revisions`,{base_revision_id:revisions[0].id,en,bn})}>{t.saveRevision}</button>
      <button disabled={busy||!revisions.length} onClick={async()=>{try{const response=await fetch(`/api/v1/cms/preview/${id}?revision=${revisions[0].id}`,{cache:"no-store"});if(!response.ok)throw new Error("CMS_PREVIEW_FAILED");setPreview(await response.json());}catch{setMessage(t.error);}}}>{t.preview}</button></div>
      {preview&&<aside className="cms-preview"><strong>{t.previewWarning}</strong>{["en","bn"].map(language=>{const content=(preview.preview as Record<string,LocaleContent>)[language];return <article key={language} lang={language}><h2>{content.title}</h2><p>{content.description}</p>{content.sections.map((part,index)=><section key={index}><h3>{part.heading}</h3>{part.type==="profile"&&<p><strong>{part.role}</strong></p>}<p>{part.body}</p></section>)}</article>;})}</aside>}</section>
      <aside className="cms-card"><h2>{t.review}</h2><p className="cms-help">{t.reviewRequired}</p><ul className="cms-list">{revisions.map(r=><li key={r.id}><strong>{t.latest} {r.revision_no}</strong> {r.review??t.draft}
        <div className="cms-actions"><button disabled={busy} onClick={()=>void action(`pages/${id}/rollback`,{revision_id:r.id})}>{t.rollback}</button></div></li>)}</ul>
      {revisions.length>0&&<><Field label={t.reviewNote} value={note} onChange={setNote}/><div className="cms-actions"><button disabled={busy||!note.trim()} onClick={()=>void action(`pages/${id}/reviews`,{revision_id:revisions[0].id,decision:"approved",note})}>{t.approve}</button>
      <button disabled={busy||!note.trim()} onClick={()=>void action(`pages/${id}/reviews`,{revision_id:revisions[0].id,decision:"rejected",note})}>{t.reject}</button>
      <button disabled={busy} onClick={()=>void action(`pages/${id}/publish`,{revision_id:revisions[0].id})}>{t.publish}</button>
      <button disabled={busy} onClick={()=>void action(`pages/${id}/archive`,{})}>{t.archive}</button></div></>}</aside></div>}
    {section==="navigation"&&!loading&&!loadFailed&&<div className="cms-grid"><section className="cms-card"><h2>{t.navigation}</h2><p className="cms-help">{t.navigationHelp}</p><ul className="cms-list">{((data.items??[]) as Array<{id:string;slot:string;position:number;label_en:string;label_bn:string;state:string}>).map(item=><li key={item.id}>{item.slot} · {item.position} · {locale==="bn"?item.label_bn:item.label_en} <span className="cms-badge">{t[item.state]}</span></li>)}</ul></section><section className="cms-card"><details className="cms-details"><summary>{t.addNavigation}</summary>
      <p className="cms-help">{t.addNavigationHelp}</p><label className="cms-field"><span>{t.slot}</span><select value={form.slot??"header"} onChange={e=>setForm({...form,slot:e.target.value})}><option value="header">{t.header}</option><option value="footer">{t.footer}</option></select></label>
      <label className="cms-field"><span>{t.targetPage}</span><select value={form.page_id??""} onChange={e=>setForm({...form,page_id:e.target.value})}><option value="">{t.selectPage}</option>{((data.pages??[]) as Page[]).map(p=><option key={p.id} value={p.id}>{(locale==="bn"?p.title_bn:p.title_en)||p.page_key}</option>)}</select></label>{field("label_en",t.labelEn)}{field("label_bn",t.labelBn)}<details className="cms-details"><summary>{t.advanced}</summary>{field("position",t.position,"number")}</details><button disabled={busy||!form.page_id||!form.label_en||!form.label_bn} onClick={()=>void action("navigation",{...form,slot:form.slot??"header",position:form.position?Number(form.position):nextNavigationPosition(form.slot??"header")})}>{t.save}</button></details></section></div>}
    {section==="media"&&!loading&&!loadFailed&&<div className="cms-grid"><section className="cms-card"><h2>{t.media}</h2><ul className="cms-list">{((data.assets??[]) as Media[]).map(m=><li key={m.id}><a href={`/api/v1/cms/media/${m.id}/content`} target="_blank" rel="noopener noreferrer">{m.filename}</a><small>{m.mime_type} · {m.byte_length}</small><span className="cms-badge">{m.public?t.public:t.private}</span>{!m.public&&<button disabled={busy} onClick={()=>void action(`media/${m.id}/publish`,{})}>{t.makePublic}</button>}</li>)}</ul></section><section className="cms-card"><h2>{t.upload}</h2><form onSubmit={e=>{e.preventDefault();const fd=new FormData(e.currentTarget);void action("media",fd);}}><label className="cms-field"><span>{t.filename}</span><input name="file" type="file" accept="image/png,image/jpeg,image/webp,application/pdf" required/></label>
      <label className="cms-field"><span>{t.rights}</span><input name="rights_reference" required/></label><label className="cms-field"><span>{t.altEn}</span><input name="alt_en" required/></label><label className="cms-field"><span>{t.altBn}</span><input name="alt_bn" required/></label><button disabled={busy}>{t.upload}</button></form></section></div>}
    {section==="seo"&&!loading&&!loadFailed&&<div className="cms-grid"><section className="cms-card"><h2>{t.seo}</h2><ul className="cms-list">{((data.pages??[]) as Array<{id:string;page_key:string;state:string;seo_title_en:string|null;seo_title_bn:string|null}>).map(p=><li key={p.id}><strong>{p.page_key}</strong><span className="cms-badge">{t[p.state]}</span><small>{p.seo_title_en??"—"} / {p.seo_title_bn??"—"}</small></li>)}</ul></section><section className="cms-card"><h2>{t.addRedirect}</h2><label className="cms-field"><span>{t.locale}</span><select value={form.locale??"en"} onChange={e=>setForm({...form,locale:e.target.value})}><option value="en">{t.english}</option><option value="bn">{t.bangla}</option></select></label>{field("source_path",t.sourcePath)}
      <label className="cms-field"><span>{t.targetPage}</span><select value={form.target_page_id??""} onChange={e=>setForm({...form,target_page_id:e.target.value})}><option value="">{t.selectPage}</option>{((data.pages??[]) as Page[]).filter(p=>p.state==="published").map(p=><option key={p.id} value={p.id}>{p.page_key}</option>)}</select></label><button disabled={busy} onClick={()=>void action("seo",{...form,locale:form.locale??"en"})}>{t.save}</button></section></div>}
    {section==="settings"&&!loading&&!loadFailed&&<section className="cms-card"><h2>{t.robots_enabled}</h2><p className="cms-help">{t.robotsHelp}</p><label className="cms-field"><span>{t.robots_enabled}</span><select value={settingDraft||"false"} onChange={e=>setForm({value:e.target.value})}><option value="false">{t.disabled}</option><option value="true">{t.enabled}</option></select></label><button disabled={busy} onClick={()=>void action("settings",{key:"robots_enabled",value:settingDraft||"false"})}>{t.save}</button></section>}
    {section==="settings"&&!loading&&!loadFailed&&<SiteContentAdmin t={t}/>}
  </div>;
}
