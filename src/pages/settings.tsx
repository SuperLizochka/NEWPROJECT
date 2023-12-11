import { useRef, useState } from "react";
import axios from "axios";

const Settings = ({ name }: { name: string }) => {
  const nameInputRef = useRef<HTMLInputElement>(null);
  const [theme, setTheme] = useState(
    localStorage.theme === "dark" ||
      (!("theme" in localStorage) &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
  );

  const changeTheme = (dark: boolean) => {
    if (dark) {
      document.documentElement.classList.add("dark");
      localStorage.theme = "dark";
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.theme = "light";
    }
    setTheme(dark);
  };

  const changeName = async () => {
    await axios.post("http://127.0.0.1:5000/api/settings/name", {
      name: nameInputRef.current?.value,
    });

    window.location.reload();
  };

  return (
    <div className="py-40 flex flex-col space-y-20 px-16">
      <div className="flex flex-col space-y-3 w-96">
        <h4 className="text-xl">Имя</h4>
        <input
          type="text"
          ref={nameInputRef}
          defaultValue={name}
          className="text-lg text-[#4D3562] font-medium dark:text-[#C8B7AF] border-b border-black dark:border-[#D4CFCB] bg-transparent focus:outline-none"
        />
        <Button name="Изменить" onClick={() => changeName()} />
      </div>
      <div className="flex flex-col space-y-3 w-96">
        <h4 className="text-xl">Тема</h4>
        <div className="flex flex-row space-x-5">
          <Button
            name="Светлая"
            activated={!theme}
            onClick={() => changeTheme(false)}
          />
          <Button
            name="Тёмная"
            activated={theme}
            onClick={() => changeTheme(true)}
          />
        </div>
      </div>
    </div>
  );
};

const Button = ({
  name,
  activated = true,
  onClick,
}: {
  name: string;
  activated?: boolean;
  onClick?: () => void;
}) => {
  return (
    <button
      {...{ onClick }}
      className={`rounded-full ${
        activated
          ? "bg-[#6E6576] text-white dark:bg-[#D4CFCB] dark:text-[#6E6576]"
          : "bg-[#B2B0B3] dark:bg-[#49464640] text-white"
      } py-2 px-10 w-fit`}
    >
      <span className="text-2xl font-light">{name}</span>
    </button>
  );
};

export default Settings;
