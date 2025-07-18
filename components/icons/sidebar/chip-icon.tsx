import * as React from "react";

const ChipIcon: React.FC<React.SVGProps<SVGElement>> = (props) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 512 512"
    stroke="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect
      width="352"
      height="352"
      x="80"
      y="80"
      fill="none"
      strokeLinejoin="round"
      strokeWidth="32"
      rx="48"
      ry="48"
    ></rect>
    <rect
      width="224"
      height="224"
      x="144"
      y="144"
      fill="none"
      strokeLinejoin="round"
      strokeWidth="32"
      rx="16"
      ry="16"
    ></rect>
    <path
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="32"
      d="M256 80V48m80 32V48M176 80V48m80 416v-32m80 32v-32m-160 32v-32m256-176h32m-32 80h32m-32-160h32M48 256h32m-32 80h32M48 176h32"
    ></path>
  </svg>
);

export default ChipIcon;
