import Link from "next/link";
import { redirect } from "next/navigation";
import { PageHead } from "@/components/club/PageHead";
import { TierBadge } from "@/components/club/TierBadge";
import { Arrow } from "@/components/ui/Button";
import { StatusPage } from "@/components/ui/StatusPage";
import { club, formatLabel, memberStatuses, optionLabel, tierLabel } from "@/content/club";
import { membership } from "@/content/membership";
import { magazin } from "@/content/magazin";
import { getViewer } from "@/lib/auth";
import { memberDiscountNote, priceFor } from "@/lib/codes";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { publishedArticles } from "@/lib/articles";
import { supabaseServer } from "@/lib/supabase/server";
import { formatDate, formatLong, formatTime } from "@/lib/time";

export default async function ClubPage() {
  const viewer = await getViewer();
  if (!viewer) redirect("/club/login");

  if (!viewer.member) {
    return <StatusPage label={club.inactive.label} headline={club.noAccess.headline} body={club.noAccess.body} />;
  }
  if (viewer.member.status === "payment_due") {
    return <StatusPage label={club.inactive.label} headline={club.paymentDue.headline} body={club.paymentDue.body} />;
  }
  if (!viewer.isActive) {
    return <StatusPage label={club.inactive.label} headline={club.inactive.headline} body={club.inactive.body} />;
  }

  const t = club.dashboard;
  const supabase = await supabaseServer();
  const [events, threads, articles, unread] = await Promise.all([
    supabase
      .from("events")
      .select("id, title, format, topic, starts_at, status")
      .eq("status", "published")
      .gte("starts_at", new Date().toISOString())
      .order("starts_at")
      .limit(3),
    supabase
      .from("forum_threads")
      .select("id, title, last_activity_at")
      .eq("status", "approved")
      .order("last_activity_at", { ascending: false })
      .limit(4),
    publishedArticles(3),
    supabase
      .from("messages")
      .select("id", { count: "exact", head: true })
      .eq("recipient_id", viewer.userId)
      .is("read_at", null),
  ]);

  const member = viewer.member;
  const subtitle = viewer.isAdmin ? "Admin" : tierLabel(member.tier);
  const plan = viewer.isAdmin ? undefined : membership.circles.find((circle) => circle.tier === member.tier);
  // Rabatt aus einem Einladungscode (Spalten sind für Mitglieder nicht freigegeben, daher serverseitig)
  const { data: discount } = plan
    ? await supabaseAdmin().from("members").select("invite_code, discount_percent, free_until").eq("user_id", viewer.userId).maybeSingle()
    : { data: null };
  const discountNote = discount ? memberDiscountNote(discount as Parameters<typeof memberDiscountNote>[0]) : null;
  const discountedPrice = plan && discount?.discount_percent ? priceFor(member.tier, discount.discount_percent as number) : null;

  return (
    <div className="container-site grid gap-14 py-section">
      <PageHead label={subtitle || club.inactive.label} headline={t.greeting.replace("{name}", member.full_name.split(" ")[0] ?? "")} />

      {plan ? (
        <section aria-labelledby="dash-membership" className="grid gap-8 border border-white p-6 md:p-8 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <h2 id="dash-membership" className="label text-white">
              {t.membership}
            </h2>
            <p className="mt-4">
              <TierBadge member={member} long />
            </p>
            <p className="headline mt-3 text-3xl">{plan.name}</p>
            <dl className="mt-6 grid gap-4">
              <div>
                <dt className="label">{t.fee}</dt>
                <dd className="mt-1">
                  <span className="headline text-3xl">{discountedPrice?.gross ?? plan.price.gross}</span>
                  <span className="ml-2 text-base text-white">{plan.period}</span>
                  <span className="mt-1 block text-sm text-slate-light">
                    {discountedPrice ? `${plan.price.vatNote} · regulär ${plan.price.gross}` : `${plan.price.vatNote} · ${plan.price.net}`}
                  </span>
                  {discountNote ? <span className="mt-2 block text-sm font-semibold text-white">Dein Vorteil: {discountNote}</span> : null}
                </dd>
              </div>
              <div>
                <dt className="label">{t.status}</dt>
                <dd className="mt-1 text-base text-white">{optionLabel(memberStatuses, member.status)}</dd>
              </div>
            </dl>
            <p className="mt-6 text-sm leading-relaxed text-slate-light">
              {membership.payment} {t.paymentQuestions}
            </p>
          </div>
          <div className="lg:col-span-7">
            <h3 className="label">{t.included}</h3>
            <ul className="mt-4 divide-y divide-line border-y border-line">
              {plan.included.map((item) => (
                <li key={item} className="flex items-start gap-4 py-3 text-base text-white">
                  <span aria-hidden="true" className="mt-2.5 h-1.5 w-1.5 shrink-0 bg-white" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-12">
        <section aria-labelledby="dash-events" className="card p-6 md:p-8 lg:col-span-7">
          <h2 id="dash-events" className="label text-white">
            {t.nextEvents}
          </h2>
          {events.data?.length ? (
            <ul className="mt-6 divide-y divide-line border-y border-line">
              {events.data.map((event) => (
                <li key={event.id} className="py-4">
                  <p className="label">{formatLabel(event.format)}</p>
                  <p className="mt-1 text-lg font-semibold">
                    {event.title}
                    {event.topic ? `: ${event.topic}` : ""}
                  </p>
                  <p className="mt-1 text-sm text-slate-light">
                    {formatLong(event.starts_at)}, {formatTime(event.starts_at)} Uhr
                  </p>
                  {viewer.isAdmin ? (
                    <Link href={`/club/admin/termine/${event.id}`} className="label mt-2 inline-block text-white underline underline-offset-4">
                      Bearbeiten
                    </Link>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-6 text-slate-light">{t.noEvents}</p>
          )}
          <DashLink href="/club/termine">{t.allEvents}</DashLink>
        </section>

        <div className="grid gap-4 lg:col-span-5">
          <section aria-labelledby="dash-messages" className="border border-white p-6 md:p-8">
            <h2 id="dash-messages" className="label text-white">
              {t.messages}
            </h2>
            <p className="headline mt-4 text-5xl tabular-nums">{unread.count ?? 0}</p>
            <DashLink href="/club/nachrichten">{t.toMessages}</DashLink>
          </section>

          <section aria-labelledby="dash-forum" className="card p-6 md:p-8">
            <h2 id="dash-forum" className="label text-white">
              {t.forum}
            </h2>
            {threads.data?.length ? (
              <ul className="mt-4 grid gap-3">
                {threads.data.map((thread) => (
                  <li key={thread.id}>
                    <Link href={`/club/forum/${thread.id}`} className="text-base text-white underline-offset-4 hover:underline">
                      {thread.title}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-slate-light">{t.noThreads}</p>
            )}
            <DashLink href="/club/forum">{t.toForum}</DashLink>
          </section>
        </div>
      </div>

      {articles.length ? (
        <section aria-labelledby="dash-magazin">
          <h2 id="dash-magazin" className="label text-white">
            {t.magazin}
          </h2>
          <ul className="mt-6 grid gap-3 md:grid-cols-3">
            {articles.map((article) => (
              <li key={article.id} className="card">
                <Link href={`/club/magazin/${article.slug}`} className="flex h-full flex-col p-6">
                  <p className="label">
                    {article.paid ? `${magazin.paidLabel} · ` : ""}
                    {formatDate(article.published_at)}
                  </p>
                  <p className="headline mt-4 text-lg leading-tight">{article.title}</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

function DashLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="group label mt-6 inline-flex items-center gap-2 text-white hover:underline">
      {children}
      <Arrow />
    </Link>
  );
}
