interface LusLogoProps {
  className?: string;
  width?: number;
  height?: number;
}

export function LusLogo({
  className = "",
  width = 24,
  height = 24,
}: LusLogoProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 246 246"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <g clipPath="url(#clip0_1_3)">
        <path
          d="M153.75 143.5C155.8 133.25 160.925 126.075 169.125 117.875C179.375 108.65 184.5 95.325 184.5 82C184.5 65.6892 178.021 50.0464 166.487 38.5129C154.954 26.9794 139.311 20.5 123 20.5C106.689 20.5 91.0464 26.9794 79.5129 38.5129C67.9794 50.0464 61.5 65.6892 61.5 82C61.5 92.25 63.55 104.55 76.875 117.875C84.05 125.05 90.2 133.25 92.25 143.5"
          stroke="currentColor"
          strokeWidth="20"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M92.25 184.5H153.75"
          stroke="currentColor"
          strokeWidth="20"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M102.5 225.5H143.5"
          stroke="currentColor"
          strokeWidth="20"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M114.69 76.5667C112.857 78.562 111 80.9537 111 84.0833C111 86.0769 111.713 87.9888 112.981 89.3984C114.25 90.8081 117.15 91.6 117.765 91.6C119.93 91.6 123.3 91.6 123.3 91.6C123.3 91.6 126.67 91.6 128.835 91.6C129.45 91.6 132.35 90.8081 133.619 89.3984C134.887 87.9888 135.6 86.0769 135.6 84.0833C135.6 80.94 133.755 78.5483 131.91 76.5667L123.3 67L114.69 76.5667Z"
          stroke="currentColor"
          strokeWidth="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M144.525 99.0833C149.107 94.095 153.75 88.1158 153.75 80.2917C153.75 75.3078 151.968 70.5281 148.796 67.004C145.625 63.4798 141.323 61.5 136.838 61.5C131.426 61.5 127.613 63.2083 123 68.3333C118.387 63.2083 114.575 61.5 109.163 61.5C104.677 61.5 100.375 63.4798 97.2036 67.004C94.0318 70.5281 92.25 75.3078 92.25 80.2917C92.25 88.15 96.8625 94.1292 101.475 99.0833L123 123L144.525 99.0833Z"
          stroke="currentColor"
          strokeWidth="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_1_3">
          <rect width="246" height="246" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}
