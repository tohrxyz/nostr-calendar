import dayGridPlugin from "@fullcalendar/daygrid";
import FullCalendar from "@fullcalendar/react";
import React, { useEffect, useMemo, useState } from "react";
import { nip19, Relay } from "nostr-tools";

interface NostrCalendarProps {
  npub: string;
  relays: string[];
}

interface NostrCalendarEventNote {
  content: string;
  created_at: number;
  id: string;
  kind: number;
  pubkey: string;
  sig: string;
  tags: string[][];
}

const CALENDAR_KIND = 31923;
const NostrCalendar: React.FC<NostrCalendarProps> = ({ npub, relays }) => {
  const [nEvents, setNEvents] = useState<NostrCalendarEventNote[]>([]);

  useEffect(() => {
    const doRelayStuff = async () => {
      const relay = await Relay.connect(relays[0]);
      console.log("Connected to ", relay.url);

      const pk = nip19.decode(npub).data;
      relay.subscribe(
        [
          {
            kinds: [CALENDAR_KIND],
            authors: [pk.toString()],
          },
        ],
        {
          onevent(event) {
            const ids = nEvents.map((e) => e.id);
            if (!ids.includes(event.id)) {
              setNEvents((prev) => [...prev, event]);
            }
          },
        },
      );
    };

    doRelayStuff();
  }, []);

  const calEvents = useMemo(() => {
    return nEvents.map((event) => {
      return {
        title: event.tags[1][1],
        date: new Date(Number(event.tags[3][1]) * 1000),
      };
    });
  }, [nEvents]);

  console.log({ calEvents });
  return (
    <section className="">
      <FullCalendar
        plugins={[dayGridPlugin]}
        initialView="dayGridMonth"
        events={calEvents}
      />
    </section>
  );
};

export default NostrCalendar;
