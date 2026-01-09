import NavLinks from "./NavLinks";
import SettingsButton from "./SettingsButton";
import AuthHeader from "./AuthHeader";
import MobileNav from "./MobileNav";

export default async function ResponsiveHeader() {
  return (
    <>
      {/* Desktop navigation - hidden on mobile */}
      <div className="hidden sm:flex items-center gap-2">
        <NavLinks />
        <SettingsButton />
        <AuthHeader />
      </div>

      {/* Mobile navigation - visible only on small screens */}
      <MobileNav>
        <AuthHeader />
      </MobileNav>
    </>
  );
}
