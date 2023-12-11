import { useRef, useState, useEffect } from "react";
import axios from "axios";

const Tracker = () => {
  const tableRef = useRef<HTMLTableElement>(null);
  const currentDate = new Date();

  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();

  const days = [...Array(daysInMonth).keys()].map((i) => i + 1);

  const [rows, setRows] = useState<IRow[]>([]);

  const addRow = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const { track } = e.currentTarget.elements as IForm;
    if (track) {
      setRows([
        ...rows,
        { name: track.value, values: [...Array(daysInMonth).fill(0)] },
      ]);
      track.value = "";
    }
  };

  const getData = async () => {
    await axios
      .get("http://127.0.0.1:5000/api/tracker", {
        params: {
          month: currentDate.getMonth() + 1,
          year: currentDate.getFullYear(),
        },
      })
      .then((res) => {
        const data = res.data;

        const rowsFromData: IRow[] = [];
        Object.keys(data.rows).map((key) => {
          console.log(data.rows[key]);
          rowsFromData.push({ name: key, values: data.rows[key] });
        });

        setRows(rowsFromData);
      });
  };

  useEffect(() => {
    getData();
  }, []);

  const updateRow = (index: number, day: number, checked: boolean) => {
    const arr = [...rows];
    arr[index]["values"][day - 1] = checked ? 1 : 0;
    setRows(arr);
  };

  const saveTable = async () => {
    await axios.post("http://127.0.0.1:5000/api/tracker", {
      rows,
      month: currentDate.getMonth() + 1,
      year: currentDate.getFullYear(),
    });
  };

  return (
    <div className="flex flex-col space-y-3 py-10 px-12 w-full">
      <h2 className="uppercase italic text-3xl dark:text-[#C8B7AF] text-[#6E6576]">
        Привычки
      </h2>
      <table className="border-collapse" ref={tableRef}>
        <thead>
          <tr>
            <th className="w-28"></th>
            {days.map((day) => (
              <th
                key={`th-day-${day}`}
                className="text-center border-x dark:border-[#96918D55] dark:text-[#D4CFCB] font-light"
              >
                {day}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={`${row.name}_${i}`}>
              <td className="border-y py-1 border-[#96918D55]">{row.name}</td>
              {days.map((day) => (
                <td
                  key={`td-track-${day}`}
                  className="border border-[#96918D55]"
                >
                  <div className="p-2 flex items-center justify-center">
                    <input
                      type="checkbox"
                      defaultChecked={row.values[day - 1] == 1}
                      onChange={(e) =>
                        updateRow(i, day, e.currentTarget.checked)
                      }
                      className="appearance-none rounded-full ring-1 dark:ring-[#D2C2B5] ring-[#6E6576] p-2 hover:cursor-pointer checked:bg-[#6E6576] dark:checked:bg-[#D2C2B5]"
                    />
                  </div>
                </td>
              ))}
            </tr>
          ))}
          <tr>
            <td className="border-y py-1 border-[#96918D55]">
              <form
                onSubmit={(e) => addRow(e)}
                className="flex flex-row space-x-2"
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
                  className="bg-transparent focus:outline-none"
                  name="track"
                />
              </form>
            </td>
            {days.map((day) => (
              <td
                key={`td-empty-${day}`}
                className="border border-[#96918D55]"
              ></td>
            ))}
          </tr>
        </tbody>
      </table>
      <div className="flex flex-row justify-end">
        <button
          className="rounded-full py-1.5 px-20 dark:bg-[#D4CFCB]"
          onClick={() => saveTable()}
        >
          <span className="text-2xl dark:text-[#6E6576]">Сохранить</span>
        </button>
      </div>
    </div>
  );
};

interface IRow {
  name: string;
  values: number[];
}

interface IForm {
  track?: HTMLInputElement;
}

interface IRowData {
  [key: string]: number[];
}

export default Tracker;
