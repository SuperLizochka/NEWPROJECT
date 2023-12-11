import axios from "axios";
import { IUser } from "../App";

const Auth = ({ setAuth }: { setAuth: (user: IUser) => void }) => {
  const auth = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const name = (e.currentTarget.elements as IForm).name?.value;
    if (name)
      await axios
        .post("http://127.0.0.1:5000/api/login", { name })
        .then((res) => setAuth(res.data.user));
  };

  return (
    <form
      className="my-48 ml-24 flex flex-col space-y-10"
      onSubmit={(e) => auth(e)}
    >
      <h3 className="font-light text-4xl dark:text-white">
        Кому принадлежит этот планер?
      </h3>
      <input
        className="border-b border-black dark:border-white bg-transparent text-3xl"
        placeholder="Введите ваше имя"
        name="name"
      />
      <button className="rounded-3xl bg-[#6E6576] dark:bg-[#D4CFCB] text-[#D4CFCB] dark:text-[#6E6576] py-4 !mt-16">
        <span className="text-3xl">Продолжить</span>
      </button>
    </form>
  );
};

interface IForm {
  name?: HTMLInputElement;
}

export default Auth;
