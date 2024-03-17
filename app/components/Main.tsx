"use client";

import Image from "next/image";
import React, { useState } from "react";
import NoggleSelector from "./NoggleSelect";
import WebCamComponent from "./WebCam";

export default function Main() {
  const [selectedNoggle, setSelectedNoggle] = useState(9);

  return (
    <>
      <Image src="/logo.png" alt="logo" width={400} height={200} />
      <NoggleSelector
        selectedNoggle={selectedNoggle}
        setSelectedNoggle={setSelectedNoggle}
      />
      <WebCamComponent selectedNoggle={selectedNoggle} />
    </>
  );
}
