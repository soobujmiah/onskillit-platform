import { cmsPage } from "@/lib/cms-page";
export const metadata = { robots: { index: false, follow: false } };
export default async function Page({params}:{params:Promise<{locale:string}>}) { return cmsPage((await params).locale,"seo"); }
