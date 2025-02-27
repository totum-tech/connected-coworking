import {
  Locale,
  format,
  getDay,
  getHours,
  getMinutes,
  isSameWeek, Day,
} from "date-fns";

import { Days } from "./use-weekview";
import { Event } from "./weekview";

export default function EventGrid({
  days,
  events,
  weekStartsOn,
  locale,
  minuteStep,
  rowHeight,
  onEventClick,
}: {
  days: Days;
  events?: Event[];
  weekStartsOn: Day;
  locale?: Locale;
  minuteStep: number;
  rowHeight: number;
  onEventClick?: (event: Event) => void;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${days.length * 2}, minmax(0, 1fr))`,
        gridTemplateRows: `repeat(${days[0].cells.length}, minmax(${rowHeight}px, 1fr))`,
      }}
    >
      {(events || [])
        .filter((event) => isSameWeek(days[0].date, event.startDate))
        .map((event) => {
          const start =
            getHours(event.startDate) * 2 +
            1 +
            Math.floor(getMinutes(event.startDate) / minuteStep);
          const end =
            getHours(event.endDate) * 2 +
            1 +
            Math.ceil(getMinutes(event.endDate) / minuteStep);

          const paddingTop =
            ((getMinutes(event.startDate) % minuteStep) / minuteStep) *
            rowHeight;

          const paddingBottom =
            (rowHeight -
              ((getMinutes(event.endDate) % minuteStep) / minuteStep) *
                rowHeight) %
            rowHeight;

          return (
            <div
              key={event.id}
              className="relative flex mt-[1px] transition-all"
              style={{
                gridRowStart: start - 12, // hardcoded because we start at 6am
                gridRowEnd: end - 12,     // need a better way to find the grid coordinate for the time
                gridColumnStart: (getDay(event.startDate) - weekStartsOn) * 2 + 1,
                gridColumnEnd: "span 2",
              }}
            >
              <span
                className="absolute inset-1 flex flex-col overflow-y-auto rounded-md p-2 text-xs leading-5 bg-blue-50 border border-transparent border-dashed hover:bg-blue-100 transition cursor-pointer"
                style={{
                  top: paddingTop + 4,
                  bottom: paddingBottom + 4,
                }}
                onClick={() => onEventClick?.(event)}
              >
                <p className="text-blue-500 leading-4">
                  {format(new Date(event.startDate), "h:mm a", {
                    weekStartsOn,
                    locale,
                  })}
                  -
                  {format(new Date(event.endDate), "h:mm a", {
                    weekStartsOn,
                    locale,
                  })}
                </p>
                <p className="font-semibold text-blue-700">{event.title}</p>
              </span>
            </div>
          );
        })}
    </div>
  );
}
