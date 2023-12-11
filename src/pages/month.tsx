import { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";

const MonthContext = createContext({
  month: 1,
  setMonth: (month: number) => {},
  year: 1,
  setYear: (year: number) => {},
});

const Month = () => {
  const currentDate = new Date();
  const [month, setMonth] = useState(currentDate.getMonth() + 1);
  const [year, setYear] = useState(currentDate.getFullYear());
  const [focus, setFocus] = useState("");
  const [days, setDays] = useState<IRecords>({});

  const getData = async () => {
    await axios
      .get("http://127.0.0.1:5000/api/month", {
        params: { month, year },
      })
      .then((res) => {
        const data = res.data;

        setFocus(data.focus);
        setDays(data.records);
      });
  };

  useEffect(() => {
    getData();
  }, []);

  return (
    <MonthContext.Provider value={{ month, setMonth, year, setYear }}>
      <div className="flex flex-col space-y-3 py-10 px-12">
        <h2 className="uppercase italic text-3xl dark:text-[#C8B7AF] text-[#6E6576]">
          {currentDate.toLocaleString("default", { month: "long" })}
        </h2>
        <Calendar records={days} />
        <div className="flex flex-col space-y-3">
          <div className="flex flex-col -space-y-1">
            <h2 className="dark:text-[#D4CFCB] text-3xl">Фокус месяца</h2>
            <svg
              width="210"
              height="16"
              viewBox="0 0 210 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M2 14C4.30612 14 6.49335 13.3871 8.76995 13.1111C21.1815 11.6068 33.7268 11.0458 46.1952 10.0001C58.9516 8.93022 71.6969 7.84897 84.4703 6.9413C94.0029 6.26392 103.563 5.89789 113.089 5.16356C127.009 4.09044 140.961 2.18112 154.954 2.00021C156.06 1.98591 153.216 2.69462 152.859 2.8368C149.806 4.05252 146.694 5.15587 143.612 6.31386C139.247 7.95412 134.799 9.37964 130.395 10.9282C129.049 11.4014 126.824 11.8417 125.647 12.6667C125.54 12.7415 127.817 12.8125 127.904 12.8105C131.447 12.7273 134.902 12.1237 138.396 11.6471C146.062 10.6012 153.647 9.20488 161.284 8.01318C176.578 5.62685 192.445 4.11782 208 4.11782"
                stroke="#C8B7AF"
                stroke-width="3"
                stroke-linecap="round"
              />
            </svg>
          </div>
          <FocusOfMonth {...{ focus, setFocus }} />
        </div>
      </div>
    </MonthContext.Provider>
  );
};

const Calendar = ({ records }: { records: IRecords }) => {
  const currentDate = new Date();
  const { year } = useContext(MonthContext);
  const days = ["пн", "вт", "ср", "чт", "пт", "сб", "вс"];
  const firstDayOfMonth = new Date(year, currentDate.getMonth(), 1).getDay();
  const daysInMonth = new Date(year, currentDate.getMonth() + 1, 0);
  let dayCount = 1;
  let calendarRows = [];

  // Add empty cells before the first day of the month
  for (let i = 1; i < firstDayOfMonth; i++) {
    calendarRows.push(
      <td key={`empty-${i}`} className="border border-[#96918D55]"></td>
    );
  }

  // Add cells for each day in the month
  for (
    let i = firstDayOfMonth;
    i <
    days.length *
      (Math.ceil(
        (daysInMonth.getDate() -
          (daysInMonth.getDay() ? daysInMonth.getDay() : 7)) /
          7
      ) +
        1);
    i++
  ) {
    if (dayCount > daysInMonth.getDate()) {
      break;
    }

    let value = "";
    if (records.hasOwnProperty(`${dayCount}`)) {
      value = records[`${dayCount}`];
    }
    calendarRows.push(
      <DayCell key={`day-${dayCount}`} day={dayCount} {...{ value }} />
    );
    dayCount++;
  }

  // Add remaining empty cells to fill out the last row
  while (calendarRows.length % 7 !== 0) {
    calendarRows.push(
      <td
        key={`empty-${calendarRows.length}`}
        className="border border-[#96918D55]"
      ></td>
    );
  }

  // Create the table rows and cells
  let calendarCells = [];
  for (let i = 0; i < calendarRows.length; i += 7) {
    calendarCells.push(
      <tr key={`row-${i}`}>{calendarRows.slice(i, i + 7)}</tr>
    );
  }

  return (
    <table className="border-collapse">
      <tbody>{calendarCells}</tbody>
    </table>
  );
};

const DayCell = ({ day, value }: { day: number; value: string }) => {
  const [record, setRecord] = useState("");
  const { month, year } = useContext(MonthContext);

  useEffect(() => {
    setRecord(value);
  }, [value]);

  const saveDay = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const valueOfDay = (e.currentTarget.elements as IDay).record?.value;

    await axios.post("http://127.0.0.1:5000/api/month/day", {
      day,
      month,
      year,
      record: valueOfDay,
    });
  };

  return (
    <td className="border border-[#96918D55]">
      <form
        className="p-2 w-48 h-32 bg-[#D4CFCB] dark:bg-[#6E6576]"
        onSubmit={(e) => saveDay(e)}
      >
        <div className="grid grid-cols-4 h-full w-full">
          <div className="col-span-3">
            <textarea
              className="h-full resize-none bg-transparent focus:outline-none"
              name="record"
              value={record}
              onChange={(e) => setRecord(e.target.value)}
            />
          </div>
          <div className="flex flex-col justify-between items-end">
            <span className="dark:text-[#D4CFCB]">{day}</span>
            <button>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="bi bi-plus-circle-fill w-7 dark:fill-[#C8B7AF] fill-[#6E6576]"
                viewBox="0 0 16 16"
              >
                <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M8.5 4.5a.5.5 0 0 0-1 0v3h-3a.5.5 0 0 0 0 1h3v3a.5.5 0 0 0 1 0v-3h3a.5.5 0 0 0 0-1h-3z" />
              </svg>
            </button>
          </div>
        </div>
      </form>
    </td>
  );
};

const FocusOfMonth = ({
  focus,
  setFocus,
}: {
  focus: string;
  setFocus: (focus: string) => void;
}) => {
  const { month, year } = useContext(MonthContext);

  const saveFocus = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    await axios.post("http://127.0.0.1:5000/api/month/focus", {
      focus,
      month,
      year,
    });
  };

  return (
    <form
      className="flex flex-row space-x-1 border-b border-[#96918D] dark:border-[#96918D] pb-2"
      onSubmit={(e) => saveFocus(e)}
    >
      <input
        className="border-none w-full bg-transparent focus:outline-none"
        name="focus"
        value={focus}
        onChange={(e) => setFocus(e.target.value)}
      />
      <button>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="bi bi-plus-circle-fill w-7 dark:fill-[#C8B7AF] fill-[#6E6576]"
          viewBox="0 0 16 16"
        >
          <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M8.5 4.5a.5.5 0 0 0-1 0v3h-3a.5.5 0 0 0 0 1h3v3a.5.5 0 0 0 1 0v-3h3a.5.5 0 0 0 0-1h-3z" />
        </svg>
      </button>
    </form>
  );
};

interface IDay {
  record?: HTMLInputElement;
}

interface IRecords {
  [key: string]: string;
}

export default Month;
