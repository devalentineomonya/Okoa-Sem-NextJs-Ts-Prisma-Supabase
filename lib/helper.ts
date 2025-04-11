import { LayoutType } from "@/components/resource-card";

export const getGridClasses = (layoutType: LayoutType) => {
  switch (layoutType) {
    case "compact":
      return "grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4";
    case "grid":
      return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6";
    case "row":
      return "grid-cols-1 gap-4";
    default:
      return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6";
  }
};



export const ALLOWED_UNITS = [
  { label: "Probability & Statistics", value: "pro_stats" },
  { label: "Multimedia System Applications", value: "mmsa" },
  { label: "Management Information System", value: "mis" },
  { label: "Client Side Programming", value: "csp" },
  { label: "Human Centered Interaction", value: "hci" },
];
