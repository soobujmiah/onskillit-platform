import { cmsPage } from "@/lib/cms-page";
export const metadata = { robots: { index: false, follow: false } };
export default async function Page({params}:{params:Promise<{locale:string;id:string}>}) { const {locale,id}=await params; return cmsPage(locale,"editor",id); }
