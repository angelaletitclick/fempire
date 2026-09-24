import { termine } from "@/content/landing";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { formatDay, formatLong, upcomingMeetings } from "@/lib/meetings";

export function Termine() {
  const meetings = upcomingMeetings();
  return (
    <Section id={termine.id} index="04" label={termine.label} headline={termine.headline} intro={termine.intro}>
      <div className="grid gap-12 lg:grid-cols-12 lg:gap-10">
        <ol className="border-t border-line lg:col-span-8">
          {meetings.map((meeting, i) => {
            return (
              <Reveal
                as="li"
                key={meeting.iso}
                delay={i * 80}
                className="grid grid-cols-[auto_1fr] items-baseline gap-x-6 gap-y-1 border-b border-line py-6 sm:grid-cols-12 sm:gap-6"
              >
                <p className="headline row-span-2 text-3xl tabular-nums sm:col-span-3 sm:row-span-1 md:text-4xl">
                  <time dateTime={meeting.iso}>{formatDay(meeting.date)}</time>
                </p>
                <p className="text-lg font-semibold sm:col-span-5">
                  {meeting.isFirst ? termine.firstTitle : termine.regularTitle}
                  <span className="block text-base font-normal text-slate">
                    {formatLong(meeting.date)} · {termine.rule.place}
                  </span>
                </p>
                <p className="label col-start-2 sm:col-span-4 sm:col-start-auto sm:text-right">{termine.note}</p>
              </Reveal>
            );
          })}
        </ol>

        <Reveal as="aside" delay={150} className="self-start border border-line p-8 lg:col-span-4">
          <p className="label text-pink">{termine.foundingNote.title}</p>
          <p className="mt-5 text-lg leading-relaxed">{termine.foundingNote.body}</p>
        </Reveal>
      </div>
    </Section>
  );
}
