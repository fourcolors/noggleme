"use client";

import React, { useState } from "react";
import NoggleSelector from "./NoggleSelect";
import WebCamComponent from "./WebCam";

export default function Main() {
  const [selectedNoggle, setSelectedNoggle] = useState(9);

  return (
    <>
      <NoggleSelector
        selectedNoggle={selectedNoggle}
        setSelectedNoggle={setSelectedNoggle}
      />
      <WebCamComponent selectedNoggle={selectedNoggle} />
    </>
  );
}
