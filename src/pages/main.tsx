import { createContext, useContext, useEffect, useState } from "react";
import Week from "./week";
import Month from "./month";
import Tracker from "./tracker";
import Settings from "./settings";

export const DayContext = createContext({
  selectedDay: 1,
  setSelectedDay: (day: number) => {},
});

const Main = ({ user }: { user: { name: string } }) => {
  const [selectedPage, setSelectedPage] = useState(-1);
  const [selectedDay, setSelectedDay] = useState(1);

  let view = null;

  switch (selectedPage) {
    case 0:
      view = <Week />;
      break;
    case 1:
      view = <Month />;
      break;
    case 2:
      view = <Tracker />;
      break;
    case 3:
      view = <Settings name={user.name} />;
      break;
  }

  return (
    <DayContext.Provider value={{ selectedDay, setSelectedDay }}>
      <div className="w-full flex flex-row">
        <SideBar
          {...{ selectedPage, setSelectedPage }}
          displayCalendar={selectedPage == 0}
        />
        {view}
      </div>
    </DayContext.Provider>
  );
};

const SideBar = ({
  selectedPage,
  setSelectedPage,
  displayCalendar,
}: {
  selectedPage: number;
  setSelectedPage: (page: number) => void;
  displayCalendar: boolean;
}) => {
  const buttons = [
    { name: "Неделя" },
    { name: "Месяц" },
    { name: "Привычки" },
    { name: "Настройки" },
  ];

  return (
    <div className="h-full rounded-r-[4rem] overflow-hidden flex flex-col justify-between dark:bg-[#494646] bg-[#C8B7AF] min-w-[450px] w-[450px]">
      <div className="py-28 px-10 flex flex-col space-y-5">
        {buttons.map((data, id) => (
          <Button
            key={data.name}
            name={data.name}
            active={id == selectedPage}
            onClick={() => setSelectedPage(id)}
          />
        ))}
      </div>
      {displayCalendar && <Calendar />}
    </div>
  );
};

const Button = ({
  name,
  active,
  onClick,
}: {
  name: string;
  active: boolean;
  onClick: () => void;
}) => {
  return (
    <button
      className="text-left flex flex-row items-center justify-between w-96"
      {...{ onClick }}
    >
      <span className="font-light text-3xl text-black dark:text-[#C8B7AF]">
        {name}
      </span>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className={`bi bi-arrow-right w-7 fill-black dark:fill-[#C8B7AF] ${
          active ? "opacity-100" : "opacity-0"
        } duration-100`}
        viewBox="0 0 16 16"
      >
        <path
          fillRule="evenodd"
          d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8"
        />
      </svg>
    </button>
  );
};

const Calendar = () => {
  const days = ["пн", "вт", "ср", "чт", "пт", "сб", "вс"];
  const currentDate = new Date();
  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).getDay();
  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  );
  let dayCount = 1;
  let calendarRows = [];

  const { setSelectedDay } = useContext(DayContext);

  useEffect(() => {
    setSelectedDay(currentDate.getDate());
  }, []);

  // Add empty cells before the first day of the month
  for (let i = 1; i < firstDayOfMonth; i++) {
    calendarRows.push(<td key={`empty-${i}`}></td>);
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
    calendarRows.push(<Day value={dayCount} key={dayCount} />);
    dayCount++;
  }

  // Add remaining empty cells to fill out the last row
  while (calendarRows.length % 7 !== 0) {
    calendarRows.push(<td key={`empty-${calendarRows.length}`}></td>);
  }

  // Create the table rows and cells
  let calendarCells = [];
  for (let i = 0; i < calendarRows.length; i += 7) {
    calendarCells.push(
      <tr key={`row-${i}`}>{calendarRows.slice(i, i + 7)}</tr>
    );
  }

  return (
    <div className="flex flex-col space-y-3 bg-[#6E657677]">
      <div className="w-3/4 border-b-2 border-[#6E6576] pl-5 pt-5">
        <h4 className="dark:text-[#D4CFCB] text-2xl mb-2">Декабрь</h4>
      </div>
      <table className="dark:text-[#D4CFCB]">
        <thead>
          <tr>
            {days.map((day) => (
              <th key={day} className="px-5 pb-10">
                {day}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{calendarCells}</tbody>
      </table>
    </div>
  );
};

const Day = ({ value }: { value: number }) => {
  const { selectedDay, setSelectedDay } = useContext(DayContext);
  const active = selectedDay == value;

  return (
    <td
      key={`day-${value}`}
      className={`text-center px-3 pb-7`}
      onClick={!active ? () => setSelectedDay(value) : undefined}
    >
      <span
        className={`p-2 duration-75 ${
          active ? "rounded-full bg-black/10" : "cursor-pointer"
        }`}
      >
        {value}
      </span>
    </td>
  );
};

export default Main;
