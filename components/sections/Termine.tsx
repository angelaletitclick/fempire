import { homeCity } from "@/content/cities";
import { termine } from "@/content/landing";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { formatDay, formatLong, upcomingMeetings } from "@/lib/meetings";

export function Termine() {
  const meetings = upcomingMeetings();
  return (
    <Section id={termine.id} index="05" label={termine.label} headline={termine.headline} intro={termine.intro}>
      <div className="grid gap-3 lg:grid-cols-12 lg:gap-4">
        <ol className="grid gap-3 lg:col-span-8">
          {meetings.map((meeting, i) => (
            <Reveal
              as="li"
              key={meeting.iso}
              delay={i * 80}
              className="card flex items-center gap-5 p-5 md:gap-8 md:p-6"
            >
              <p className="flex h-16 w-16 shrink-0 flex-col items-center justify-center border border-line md:h-20 md:w-20">
                <time dateTime={meeting.iso} className="headline text-lg tabular-nums md:text-2xl">
                  {formatDay(meeting.date)}
                </time>
              </p>
              <div className="min-w-0 flex-1">
                <p className="text-lg font-semibold">{meeting.isFirst ? termine.firstTitle : termine.regularTitle}</p>
                <p className="mt-1 text-sm text-slate-light md:text-base">
                  {formatLong(meeting.date)} · {homeCity.name}
                </p>
              </div>
              <p className="label hidden sm:block">{termine.note}</p>
            </Reveal>
          ))}
        </ol>

        <Reveal as="aside" delay={150} className="self-start border border-white p-6 md:p-8 lg:col-span-4">
          <p className="label text-white">{termine.events.title}</p>
          <p className="mt-4 text-lg leading-relaxed">{termine.events.body}</p>
        </Reveal>
      </div>
    </Section>
  );
}
