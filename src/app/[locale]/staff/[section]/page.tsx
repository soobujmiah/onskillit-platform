import { notFound, redirect } from "next/navigation";
import { getDictionary } from "@/i18n/get-dictionary";
import { isLocale } from "@/i18n/locales";
import { hasAnyPermission, hasPermission } from "@/lib/identity";
import { privateIdentity } from "@/lib/identity-page";
import { ApproveGrantAction, GrantRoleAction, UserStatusAction } from "@/components/identity/StaffActions";
import { decodeCursor, listAudit, listUsers } from "@/lib/identity-list";
import Link from "next/link";

export async function generateMetadata({ params }: { params: Promise<{ locale: string; section: string }> }) {
  const { locale, section } = await params;
  if (!isLocale(locale)) return { robots: { index: false, follow: false } };
  const t = getDictionary(locale).identity;
  return { title: section === "users" ? t.users : section === "roles" ? t.roles : t.audit,
    robots: { index: false, follow: false } };
}
const permissions = { users: "users.read", roles: "roles.read", audit: "audit.read" } as const;
type StaffRow = {
  id: string; normalized: string | null; status: string; can_manage: boolean;
  action: string; outcome: string; operator_identity: string | null;
  actor_user_id: string | null; target_user_id: string | null;
  created_at: Date; reason: string | null;
};

export default async function StaffPage({ params, searchParams }: {
  params: Promise<{ locale: string; section: string }>;
  searchParams: Promise<{ cursor?: string }>;
}) {
  const { locale, section } = await params;
  if (!isLocale(locale) || !(section in permissions)) notFound();
  const cursor = decodeCursor((await searchParams).cursor);
  if (cursor === null) notFound();
  const { db, session } = await privateIdentity(locale);
  try {
    const permission = permissions[section as keyof typeof permissions];
    if (!await hasAnyPermission(db, session.userId, permission)) redirect(`/${locale}/forbidden`);
    const dictionary = getDictionary(locale);
    const t = dictionary.identity;
    const canManageRoles = section === "roles" && await hasPermission(db, session.userId, "roles.manage");
    const statusLabel: Record<string, string> = { active: t.activeStatus, suspended: t.suspendedStatus,
      inactive: t.inactiveStatus, deletion_pending: t.pendingStatus };
    const roleLabel: Record<string, string> = { support: t.supportRole, member: t.memberRole,
      security_admin: t.securityRole, owner: t.ownerRole };
    const title = section === "users" ? t.users : section === "roles" ? t.roles : t.audit;
    const page = section === "users" ? await listUsers(db, session.userId, cursor)
      : section === "audit" ? await listAudit(db, cursor) : null;
    const rows = (page?.items ?? await db`SELECT id,label FROM identity_role ORDER BY id`) as unknown as StaffRow[];
    const pending = canManageRoles ? await db`SELECT id,requested_by,target_user_id,role_id,reason
      FROM identity_grant_request WHERE status='pending' ORDER BY requested_at DESC LIMIT 50` : [];
    return <section className="identity-panel"><h1>{title}</h1>
      {rows.length ? <ul>{rows.map((row, index) => <li key={index} className="identity-record">
        {section === "users" ? <>{row.normalized} ({statusLabel[row.status] ?? row.status}) {row.can_manage && <UserStatusAction userId={row.id} status={row.status} dictionary={dictionary} />}</> : section === "roles" ? roleLabel[row.id] ?? row.id : <>
          <strong>{row.action}</strong> — {t.outcome}: {row.outcome}<br />
          {t.actor}: {row.operator_identity ?? row.actor_user_id ?? "—"}<br />
          {t.target}: {row.target_user_id ?? "—"}<br />
          {t.at}: {new Intl.DateTimeFormat(locale === "bn" ? "bn-BD" : "en-US", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Dhaka" }).format(new Date(row.created_at))}
          {row.reason && <p>{t.reason}: {row.reason}</p>}</>}
      </li>)}</ul> : <p>{t.empty}</p>}
      {page?.nextCursor && <Link href={`/${locale}/staff/${section}?cursor=${encodeURIComponent(page.nextCursor)}`}>{t.nextPage}</Link>}
      {canManageRoles && <GrantRoleAction dictionary={dictionary} />}
      {canManageRoles && <section><h2>{t.pendingGrants}</h2><ul>{pending.map((item) =>
        <li key={item.id} className="identity-record">{roleLabel[item.role_id] ?? item.role_id}: {item.target_user_id} — {item.reason}
          {item.requested_by !== session.userId && item.target_user_id !== session.userId &&
            <ApproveGrantAction requestId={item.id} dictionary={dictionary} />}</li>)}</ul>
        {!pending.length && <p>{t.empty}</p>}</section>}
    </section>;
  } finally { await db.end(); }
}
