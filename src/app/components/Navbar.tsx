import Image from 'next/image'
import Link from 'next/link'
import React from 'react'



const navIcons = [
    { src: '/assets/icons/search.svg', alt: 'search' },
    { src: '/assets/icons/black-heart.svg', alt: 'heart' },
    { src: '/assets/icons/user.svg', alt: 'user' },
  ]
 export default function  Navbar () {
  return (    <header className="w-full">
  <nav className="flex justify-between items-center px-6 md:px-20 py-4">
    <Link href="/" className="flex items-center gap-1">
      <Image 
        src="/assets/icons/logo.svg"
        width={27}
        height={27}
        alt="logo"
      />

      <p className="text-[21px] text-secondary font-bold">
        Price<span className='text-primary'>Wise</span>
      </p>
    </Link>

    <div className="flex items-center gap-5">
      {navIcons.map((icon) => (
        <Image 
          key={icon.alt}
          src={icon.src}
          alt={icon.alt}
          width={28}
          height={28}
          className="object-contain"
        />
      ))}
    </div>
  </nav>
</header>
)
 }
