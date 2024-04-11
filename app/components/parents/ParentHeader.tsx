import MenuSvg from "../icons/MenuSvg";
// TODO - make this a reusable component for parent/studio/etc.

export type HeaderProps = {
  userType: string;
  links: NavLink[];
};

export type NavLink = {
  label: string;
  url: string;
};

export default function ParentHeader({
  showNav,
  toggleShowNav,
}: {
  showNav: boolean;
  toggleShowNav: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  return (
    <header className="header bg-slate-900">
      {!showNav && (
        <button
          className=" grid place-items-center md:hidden"
          type="button"
          aria-label="show navigation menu"
          onClick={(e) => {
            e.stopPropagation();
            toggleShowNav(!showNav);
          }}
        >
          <MenuSvg />
        </button>
      )}
    </header>
  );
}
