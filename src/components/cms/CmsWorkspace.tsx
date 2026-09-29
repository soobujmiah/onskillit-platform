"use client";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type Text = Record<string,string>;
type LocaleContent = { title:string; slug:string; description:string; seoTitle:string; seoDescription:string;
  sections:Array<{type:"hero"|"text"|"cta";heading:string;body:string;source:string;href?:string;mediaId?:string}> };
type Revision = {id:string;revision_no:number;en:LocaleContent;bn:LocaleContent;created_by:string;review:string|null};
type Page = {id:string;page_key:string;kind:string;state:string;published_revision_id:string|null;latest_revision:number};
type Media = {id:string;filename:string;mime_type:string;byte_length:number;public:boolean;rights_reference:string;alt_en:string;alt_bn:string};
const blank=():LocaleContent=>({title:"",slug:"",description:"",seoTitle:"",seoDescription:"",sections:[]});
function Field({label,value,onChange,multiline=false}:{label:string;value:string;onChange:(value:string)=>void;multiline?:boolean}) {
  return <label className="cms-field"><span>{label}</span>{multiline?<textarea value={value} onChange={e=>onChange(e.target.value)} rows={4}/>:<input value={value} onChange={e=>onChange(e.target.value)}/>}</label>;
}
export function CmsWorkspace({locale,section,id,t,title}:{locale:string;section:"pages"|"editor"|"navigation"|"media"|"seo"|"settings";id?:string;t:Text;title:string}) {
  const [data,setData]=useState<Record<string,unknown>>({});
  const [busy,setBusy]=useState(false); const [message,setMessage]=useState("");
  const [en,setEn]=useState<LocaleContent>(blank); const [bn,setBn]=useState<LocaleContent>(blank);
  const [pageKey,setPageKey]=useState(""); const [kind,setKind]=useState("page");
  const [note,setNote]=useState(""); const [preview,setPreview]=useState<Record<string,unknown>|null>(null);
  const [form,setForm]=useState<Record<string,string>>({});
  const endpoint=section==="editor"?`pages/${id}`:section;
  const reload=useCallback(async()=>{
    const response=await fetch(`/api/v1/cms/${endpoint}`,{credentials:"same-origin",cache:"no-store"});
    if (!response.ok) {setMessage(t.error);return;}
    const next=await response.json() as Record<string,unknown>;setData(next);
    if (section==="editor") { const revisions=next.revisions as Revision[];
      if (revisions?.length) {setEn(revisions[0].en);setBn(revisions[0].bn);} }
  },[endpoint,section,t.error]);
  useEffect(()=>{void reload();},[reload]);
  async function action(path:string,body:object|FormData) {
    setBusy(true);setMessage("");
    try { const csrf=document.cookie.split("; ").find(x=>x.startsWith("onskillit_csrf="))?.split("=")[1] ?? "";
      const response=await fetch(`/api/v1/cms/${path}`,{method:"POST",credentials:"same-origin",
        headers:{"x-csrf-token":decodeURIComponent(csrf),...(body instanceof FormData?{}:{"content-type":"application/json"})},
        body:body instanceof FormData?body:JSON.stringify(body)});
      const result=await response.json() as {id?:string;code?:string};
      setMessage(response.ok?t.success:`${t.error} ${result.code ?? ""}`);
      if (response.ok) {await reload(); if (path==="pages" && result.id) window.location.href=`/${locale}/staff/content/pages/${result.id}`;}
    } catch {setMessage(t.error);} finally {setBusy(false);} }
  function field(name:string,label:string,type="text") {return <label className="cms-field"><span>{label}</span><input type={type} value={form[name]??""} onChange={e=>setForm({...form,[name]:e.target.value})}/></label>;}
  function localeEditor(value:LocaleContent,set:(next:LocaleContent)=>void,label:string) {
    const update=(key:keyof LocaleContent,v:string)=>set({...value,[key]:v});
    return <fieldset className="cms-locale"><legend>{label}</legend>
      <Field label={t.title} value={value.title} onChange={v=>update("title",v)}/>
      <Field label={t.slug} value={value.slug} onChange={v=>update("slug",v)}/>
      <Field label={t.description} value={value.description} onChange={v=>update("description",v)} multiline/>
      <Field label={t.seoTitle} value={value.seoTitle} onChange={v=>update("seoTitle",v)}/>
      <Field label={t.seoDescription} value={value.seoDescription} onChange={v=>update("seoDescription",v)} multiline/>
      <h3>{t.sections}</h3>{value.sections.map((s,index)=><fieldset key={index} className="cms-section"><legend>{index+1}. {t[s.type]}</legend>
        <label className="cms-field"><span>{t.kind}</span><select value={s.type} onChange={e=>{const sections=[...value.sections];sections[index]={...s,type:e.target.value as typeof s.type};set({...value,sections});}}><option value="hero">{t.hero}</option><option value="text">{t.text}</option><option value="cta">{t.cta}</option></select></label>
        {(["heading","body","source",...(s.type==="cta"?["href"]:["mediaId"])] as Array<"heading"|"body"|"source"|"href"|"mediaId">).map(key=><Field key={key} label={t[key=== "href"?"link":key]} value={s[key]??""} multiline={key==="body"} onChange={v=>{const sections=[...value.sections];const next={...s,[key]:v};if(key==="mediaId"&&!v)delete next.mediaId;if(key==="href"&&!v)delete next.href;sections[index]=next;set({...value,sections});}}/>)}</fieldset>)}
      <button type="button" onClick={()=>set({...value,sections:[...value.sections,{type:"text",heading:"",body:"",source:""}]})}>{t.addSection}</button>
    </fieldset>;
  }
  const revisions=(data.revisions??[]) as Revision[];
  return <main className="cms-workspace"><header className="cms-heading"><p className="cms-eyebrow">{t.noPublicPages}</p><h1>{title}</h1>
    {section==="editor"&&<Link href={`/${locale}/staff/content/pages`}>{t.back}</Link>}</header>
    {message&&<p role="status" className="cms-message">{message}</p>}
    {section==="pages"&&<div className="cms-grid"><section className="cms-card"><h2>{t.pages}</h2><ul className="cms-list">{((data.pages??[]) as Page[]).map(p=><li key={p.id}><Link href={`/${locale}/staff/content/pages/${p.id}`}>{p.page_key}</Link><span className="cms-badge">{t[p.state]}</span><small>{t.latest}: {p.latest_revision}</small></li>)}</ul>{!(data.pages as Page[]|undefined)?.length&&<p>{t.empty}</p>}</section>
      <section className="cms-card"><h2>{t.newPage}</h2>{field("page_key",t.pageKey)}<label className="cms-field"><span>{t.kind}</span><select value={kind} onChange={e=>setKind(e.target.value)}><option value="page">{t.pages}</option><option value="landing">{t.hero}</option></select></label>
      {localeEditor(en,setEn,t.english)}{localeEditor(bn,setBn,t.bangla)}<button disabled={busy} onClick={()=>void action("pages",{page_key:form.page_key,kind,en,bn})}>{t.newPage}</button></section></div>}
    {section==="editor"&&<div className="cms-grid"><section className="cms-card"><h2>{(data.page as Page|undefined)?.page_key??t.editor}</h2><p className="cms-badge">{t[(data.page as Page|undefined)?.state??"draft"]}</p>
      {localeEditor(en,setEn,t.english)}{localeEditor(bn,setBn,t.bangla)}
      <div className="cms-actions"><button disabled={busy||!revisions.length} onClick={()=>void action(`pages/${id}/revisions`,{base_revision_id:revisions[0].id,en,bn})}>{t.saveRevision}</button>
      <button disabled={busy||!revisions.length} onClick={async()=>{const response=await fetch(`/api/v1/cms/preview/${id}?revision=${revisions[0].id}`,{cache:"no-store"});if(response.ok)setPreview(await response.json());}}>{t.preview}</button></div>
      {preview&&<aside className="cms-preview"><strong>{t.previewWarning}</strong>{["en","bn"].map(language=>{const content=(preview.preview as Record<string,LocaleContent>)[language];return <article key={language} lang={language}><h2>{content.title}</h2><p>{content.description}</p>{content.sections.map((part,index)=><section key={index}><h3>{part.heading}</h3><p>{part.body}</p></section>)}</article>;})}</aside>}</section>
      <aside className="cms-card"><h2>{t.latest}</h2><p>{t.reviewRequired}</p><ul className="cms-list">{revisions.map(r=><li key={r.id}><strong>{r.revision_no}</strong> {r.review??t.draft}
        <div className="cms-actions"><button disabled={busy} onClick={()=>void action(`pages/${id}/rollback`,{revision_id:r.id})}>{t.rollback}</button></div></li>)}</ul>
      {revisions.length>0&&<><Field label={t.reviewNote} value={note} onChange={setNote}/><div className="cms-actions"><button disabled={busy||!note.trim()} onClick={()=>void action(`pages/${id}/reviews`,{revision_id:revisions[0].id,decision:"approved",note})}>{t.approve}</button>
      <button disabled={busy||!note.trim()} onClick={()=>void action(`pages/${id}/reviews`,{revision_id:revisions[0].id,decision:"rejected",note})}>{t.reject}</button>
      <button disabled={busy} onClick={()=>void action(`pages/${id}/publish`,{revision_id:revisions[0].id})}>{t.publish}</button>
      <button disabled={busy} onClick={()=>void action(`pages/${id}/archive`,{})}>{t.archive}</button></div></>}</aside></div>}
    {section==="navigation"&&<div className="cms-grid"><section className="cms-card"><h2>{t.navigation}</h2><ul className="cms-list">{((data.items??[]) as Array<{id:string;slot:string;position:number;label_en:string;label_bn:string;state:string}>).map(item=><li key={item.id}>{item.slot} · {item.position} · {locale==="bn"?item.label_bn:item.label_en} <span className="cms-badge">{t[item.state]}</span></li>)}</ul></section><section className="cms-card"><h2>{t.addNavigation}</h2>
      {field("slot",t.slot)}{field("position",t.position,"number")}{field("page_id",t.targetPage)}{field("label_en",t.labelEn)}{field("label_bn",t.labelBn)}<button disabled={busy} onClick={()=>void action("navigation",{...form,position:Number(form.position)})}>{t.save}</button></section></div>}
    {section==="media"&&<div className="cms-grid"><section className="cms-card"><h2>{t.media}</h2><ul className="cms-list">{((data.assets??[]) as Media[]).map(m=><li key={m.id}><a href={`/api/v1/cms/media/${m.id}/content`} target="_blank" rel="noopener noreferrer">{m.filename}</a><small>{m.mime_type} · {m.byte_length}</small><span className="cms-badge">{m.public?t.public:t.private}</span>{!m.public&&<button disabled={busy} onClick={()=>void action(`media/${m.id}/publish`,{})}>{t.makePublic}</button>}</li>)}</ul></section><section className="cms-card"><h2>{t.upload}</h2><form onSubmit={e=>{e.preventDefault();const fd=new FormData(e.currentTarget);void action("media",fd);}}><label className="cms-field"><span>{t.filename}</span><input name="file" type="file" accept="image/png,image/jpeg,image/webp,application/pdf" required/></label>
      <label className="cms-field"><span>{t.rights}</span><input name="rights_reference" required/></label><label className="cms-field"><span>{t.altEn}</span><input name="alt_en" required/></label><label className="cms-field"><span>{t.altBn}</span><input name="alt_bn" required/></label><button disabled={busy}>{t.upload}</button></form></section></div>}
    {section==="seo"&&<div className="cms-grid"><section className="cms-card"><h2>{t.seo}</h2><ul className="cms-list">{((data.pages??[]) as Array<{id:string;page_key:string;state:string;seo_title_en:string|null;seo_title_bn:string|null}>).map(p=><li key={p.id}><strong>{p.page_key}</strong><span className="cms-badge">{t[p.state]}</span><small>{p.seo_title_en??"—"} / {p.seo_title_bn??"—"}</small></li>)}</ul></section><section className="cms-card"><h2>{t.addRedirect}</h2>{field("locale",t.locale)}{field("source_path",t.sourcePath)}{field("target_page_id",t.targetPage)}<button disabled={busy} onClick={()=>void action("seo",form)}>{t.save}</button></section></div>}
    {section==="settings"&&<div className="cms-grid"><section className="cms-card"><h2>{t.siteSettings}</h2><ul className="cms-list">{((data.settings??[]) as Array<{key:string;value:string}>).map(s=><li key={s.key}><strong>{s.key}</strong><small>{s.value}</small></li>)}</ul></section><section className="cms-card"><h2>{t.save}</h2><label className="cms-field"><span>{t.settingKey}</span><select value={form.key??"site_name_en"} onChange={e=>setForm({...form,key:e.target.value})}>{["site_name_en","site_name_bn","contact_email","robots_enabled"].map(k=><option key={k} value={k}>{k}</option>)}</select></label>{field("value",t.value)}<button disabled={busy} onClick={()=>void action("settings",{key:form.key??"site_name_en",value:form.value??""})}>{t.save}</button></section></div>}
  </main>;
}
