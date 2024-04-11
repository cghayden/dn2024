import { Link } from "react-router-dom";
import { Form } from "@remix-run/react";
import type { NavLink } from "types";
import { useEffect, useRef } from "react";
import MenuSvg from "../icons/MenuSvg";
import { ParentNavData } from "~/models/parent.server";

export default function ParentNav({
  links,
  showNav,
  toggleShowNav,
  parentNavData,
}: {
  links: NavLink[];
  showNav: boolean;
  toggleShowNav: React.Dispatch<React.SetStateAction<boolean>>;
  parentNavData: ParentNavData;
}) {
  const settingsLinks = links.filter((link) => link.url.startsWith("config"));
  const contentLinks = links.filter((link) => link.url.startsWith("/"));
  const dancerLinks = links.filter((link) => link.url.startsWith("dancer"));
  const studioLinks = links.filter((link) => link.url.startsWith("studio"));

  const navRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        toggleShowNav(false);
      }
    }

    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [navRef, toggleShowNav]);

  return (
    <div
      ref={navRef}
      className={`nav_frame_custom fixed left-0 z-20  flex  h-full items-stretch bg-gray-200 text-gray-900 transition-all
    ${showNav ? "translate-x-0 " : "-translate-x-full"}
    `}
    >
      <nav className="nav_custom flex h-full min-h-full min-w-[15rem] flex-auto flex-col items-stretch">
        <div className="flex h-[3.5rem] items-center bg-slate-900 p-4 text-slate-50 ">
          <button
            className=" grid place-items-center text-slate-50 md:hidden"
            type="button"
            aria-label="show navigation menu"
            onClick={(e) => {
              toggleShowNav(!showNav);
            }}
          >
            <MenuSvg />
          </button>
        </div>
        <Link to={"/parent"} className=" inline-block py-2 pl-4 font-bold">
          Home
        </Link>
        <div className="my-2">
          <legend className=" pl-4 font-bold">Dancers</legend>

          <ul>
            {dancerLinks.map((link) => (
              <li key={link.label} className="px-3">
                <Link
                  className="my-2 flex items-center pl-4 pr-2"
                  to={`${link.url}`}
                  onClick={() => {
                    toggleShowNav(false);
                  }}
                >
                  <span>{link.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="my-2">
          <legend className=" pl-4 font-bold">Studios</legend>

          <ul>
            {studioLinks.map((link) => (
              <li key={link.label} className="px-3">
                <Link
                  className="my-2 flex items-center pl-4 pr-2"
                  to={`${link.url}`}
                  onClick={() => {
                    toggleShowNav(false);
                  }}
                >
                  <span>{link.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="my-2">
          <legend className=" pl-4 font-bold">Actions</legend>

          <ul>
            {contentLinks.map((link) => (
              <li key={link.label} className="px-3">
                <Link
                  className="my-2 flex items-center pl-4 pr-2"
                  to={`${link.url}`}
                  onClick={() => {
                    toggleShowNav(false);
                  }}
                >
                  <span>{link.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="my-2 pb-6">
          <legend className=" text-l pl-4 font-bold">Settings</legend>
          <ul>
            {settingsLinks.map((link) => (
              <li key={link.label} className="px-3">
                <Link
                  className="my-2 flex items-center pl-4 pr-2"
                  to={`${link.url}`}
                  onClick={() => {
                    toggleShowNav(false);
                  }}
                >
                  {/* <div className='w-[20px] h-[20px] bg-white mr-2 mt-2 mb-2'></div> */}
                  <span>{link.label}</span>
                </Link>
              </li>
            ))}
            <li className="px-3">
              <Form
                className="my-2 flex items-center pl-4 pr-2"
                action="/logout"
                method="post"
              >
                <button type="submit">Logout</button>
              </Form>
            </li>
          </ul>
        </div>
      </nav>
    </div>
  );
}
