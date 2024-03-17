"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

interface NoggleSelector {
  selectedNoggle: number;
  setSelectedNoggle: (noggle: number) => void;
}

export default function NoggleSelector({
  selectedNoggle,
  setSelectedNoggle,
}: NoggleSelector) {
  const noggles = Array.from({ length: 21 }, (_, i) => `/noggles/${i}.png`);
  const containerRef = useRef();

  useEffect(() => {
    // Center the selected item
    const selectedItem = document.getElementById(`item-${selectedNoggle}`);
    const scrollAmount =
      selectedItem.offsetLeft +
      selectedItem.offsetWidth / 2 -
      containerRef.current.offsetWidth / 2;
    containerRef.current.scrollLeft = scrollAmount;
  }, [selectedNoggle]);

  return (
    <div ref={containerRef} className="flex overflow-x scroll-smooth my-8">
      {noggles.map((src, index) => (
        <motion.div
          key={src}
          id={`item-${index}`}
          className={`flex justify-center items-center mx-2 cursor-pointer
            ${index === selectedNoggle ? "scale-150" : "scale-100"}`}
          onClick={() => setSelectedNoggle(index)}
          animate={{ scale: index === selectedNoggle ? 3 : 1 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Image
            src={src}
            width={100}
            height={100}
            alt={`Noggle ${index}`}
            className="w-24 h-24 object-contain"
          />
        </motion.div>
      ))}
    </div>
  );
}
