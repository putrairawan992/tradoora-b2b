import { BestSeller } from "~/components/sections/BestSeller";
import { Brands } from "~/components/sections/Brands";
import { Category } from "~/components/sections/Category";
import { NewProduct } from "~/components/sections/NewProduct";
import { HeroSectionsNew } from "~/components/sections/HeroSectionsNew";
import { SpecialOffers } from "~/components/sections/SpecialOffers";
import { Subscribe } from "~/components/sections/Subscribe";
import { Testimoni } from "~/components/sections/Testimoni";
import { Separator } from "~/components/ui/separator";

export default function Landing() {
  return (
    <>
      <HeroSectionsNew/>
      <Category/>
      <Separator className="border-4"/>
      <NewProduct/>
      <BestSeller/>
      <SpecialOffers/>
      <Testimoni/>
      <Brands/>
      <Subscribe/>
    </>
  );
}
