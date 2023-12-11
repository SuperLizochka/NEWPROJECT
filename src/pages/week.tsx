import { useContext, useEffect, useState } from "react";
import { DayContext } from "./main";
import axios from "axios";

const Week = () => {
  const [records, setRecords] = useState<IRecords>({});
  const { selectedDay, setSelectedDay } = useContext(DayContext);
  const currentDate = new Date();
  const month = currentDate.getMonth() + 1;
  const year = currentDate.getFullYear();

  const daysOfWeek = [
    "понедельник",
    "вторник",
    "среда",
    "четверг",
    "пятница",
    "суббота",
    "воскресенье",
  ];

  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  );

  const lastDayOfMonth = daysInMonth.getDate();

  const [days, setDays] = useState<IDay[]>([]);

  /*days.length *
    (Math.ceil(
      (lastDayOfMonth - (daysInMonth.getDay() ? daysInMonth.getDay() : 7)) / 7
    ) +
      1);*/

  useEffect(() => {
    if (selectedDay >= 1 && selectedDay <= 7) {
      setDays(
        Array(7)
          .fill(0)
          .map((_, i) => i + 1)
          .map((day) => {
            const d = new Date();
            d.setDate(day);

            const formatDay = d.getDay() - 1;
            const dayOfWeek = formatDay > 0 ? formatDay : 6;

            return {
              value: day,
              desc: daysOfWeek[dayOfWeek],
            };
          })
      );
    } else if (
      selectedDay >= lastDayOfMonth - 7 &&
      selectedDay <= lastDayOfMonth
    ) {
      setDays(
        Array(7)
          .fill(0)
          .map((_, i) => lastDayOfMonth - 1 - i)
          .map((day) => {
            const d = new Date();
            d.setDate(day);

            const formatDay = d.getDay() - 1;
            const dayOfWeek = formatDay > 0 ? formatDay : 6;

            return {
              value: day,
              desc: daysOfWeek[dayOfWeek],
            };
          })
          .reverse()
      );
    } else {
      setDays(
        [
          selectedDay - 3,
          selectedDay - 2,
          selectedDay - 1,
          selectedDay,
          selectedDay + 1,
          selectedDay + 2,
          selectedDay + 3,
        ].map((day) => {
          const d = new Date();
          d.setDate(day);

          const formatDay = d.getDay() - 1;
          const dayOfWeek = formatDay > 0 ? formatDay : 6;

          return {
            value: day,
            desc: daysOfWeek[dayOfWeek],
          };
        })
      );
    }
  }, [selectedDay]);

  const getData = async ({
    day,
    month,
    year,
  }: {
    day: number;
    month: number;
    year: number;
  }) => {
    await axios
      .get("http://127.0.0.1:5000/api/day", {
        params: {
          day,
          month,
          year,
        },
      })
      .then((res) => setRecords(res.data.records));
  };

  useEffect(() => {
    getData({ day: selectedDay, month, year });
  }, [selectedDay, month, year]);

  const saveRow = async ({ time, value }: { time: string; value: string }) => {
    await axios.post("http://127.0.0.1:5000/api/day", {
      day: selectedDay,
      month,
      year,
      time,
      value,
    });
  };

  return (
    <div className="flex flex-col space-y-2 p-5">
      <div className="grid grid-cols-7 px-10">
        {days.map((day) => (
          <Button
            key={day.value}
            data={day}
            onClick={() => setSelectedDay(day.value)}
            activated={selectedDay == day.value}
          />
        ))}
      </div>
      <div className="flex flex-col w-full space-y-1">
        {Array(19)
          .fill(0)
          .map((_, i) => i + 6)
          .map((el: number) => {
            let value = "";
            if (records.hasOwnProperty(`${el}:00`)) {
              value = records[`${el}:00`];
            }
            return (
              <Row
                key={`${el}_${selectedDay}_${month}_${year}`}
                data={el}
                action={saveRow}
                {...{ value }}
              />
            );
          })}
      </div>
    </div>
  );
};

const Button = ({
  data,
  onClick,
  activated = false,
}: {
  data: { value: number; desc: string };
  onClick: () => void;
  activated?: boolean;
}) => {
  return (
    <button
      {...{ onClick }}
      className={`border border-[#AEAAAA] ${
        activated ? "bg-[#A49698]" : "bg-[#D2C2B5]"
      } flex flex-col py-0.5 px-9 items-center duration-100`}
    >
      <h4 className="font-semibold text-3xl text-center">{data.value}</h4>
      <span className="font-light text-lg">{data.desc}</span>
    </button>
  );
};

const Row = ({
  data,
  action,
  value,
}: {
  data: number;
  action: (data: IRowData) => void;
  value: string;
}) => {
  const saveRow = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const fields = e.currentTarget.elements as IRow;
    const row_field = fields.row_field?.value;
    const time = fields.time?.value;
    if (row_field && time) action({ time, value: row_field });
  };

  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  return (
    <div className="flex flex-row space-x-2 w-full">
      <div className="flex flex-col items-end w-20">
        <span className="dark:text-[#C8B7AF] font-light">{data}:00</span>
      </div>
      <form
        className="border-b dark:border-[#96918D] border-[#96918D] w-full pb-2.5 flex flex-row space-x-1"
        onSubmit={(e) => saveRow(e)}
      >
        <button>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="bi bi-plus-circle-fill w-7 dark:fill-[#C8B7AF] fill-[#6E6576]"
            viewBox="0 0 16 16"
          >
            <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M8.5 4.5a.5.5 0 0 0-1 0v3h-3a.5.5 0 0 0 0 1h3v3a.5.5 0 0 0 1 0v-3h3a.5.5 0 0 0 0-1h-3z" />
          </svg>
        </button>
        <input
          className="border-none bg-transparent focus:outline-none"
          name="row_field"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
        <input type="hidden" name="time" value={`${data}:00`} />
      </form>
    </div>
  );
};

interface IRow {
  row_field?: HTMLInputElement;
  time?: HTMLInputElement;
}

interface IRowData {
  time: string;
  value: string;
}

interface IDay {
  value: number;
  desc: string;
}

interface IRecords {
  [key: string]: string;
}

export default Week;
