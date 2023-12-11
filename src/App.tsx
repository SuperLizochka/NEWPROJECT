import "./App.css";
import Auth from "./pages/auth";
import Main from "./pages/main";
import { useEffect, useState } from "react";

const App = () => {
  useEffect(() => {
    if (
      localStorage.theme === "dark" ||
      (!("theme" in localStorage) &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const [auth, setAuth] = useState<IUser>();
  return (
    <div className="min-h-screen w-screen bg-[#D4CFCB] dark:bg-[#6E6576] flex font-nunito text-black">
      <div className="fixed top-8 left-0 px-5 py-2 bg-[#6E6576] dark:bg-[#D4CFCB]">
        <h3 className="font-nerko text-[#D4CFCB] dark:text-[#6E6576] text-3xl">
          Get organized
        </h3>
      </div>
      {!auth ? (
        <Auth setAuth={(user: IUser) => setAuth(user)} />
      ) : (
        <Main user={auth} />
      )}
    </div>
  );
};

export interface IUser {
  id: number;
  name: string;
}

export default App;
