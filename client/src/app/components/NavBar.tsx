// components/NavBar.tsx
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import Icon from '@/src/app/components/Icon';

type NavLink = {
    href: string;
    label: string;
};

const navLinks: NavLink[] = [
    { href: '/new', label: 'NEW' },
    { href: '/brands', label: 'BRANDS' },
    { href: '/accessories', label: 'ACCESSORIES' },
    { href: '/disposibles', label: 'DISPOSIBLES' },
    { href: '/startkits', label: 'STARTER KITS' },
    { href: '/startkits', label: 'STARTER KITS' },
    { href: '/startkits', label: 'STARTER KITS' },
    { href: '/startkits', label: 'STARTER KITS' },

];

const NavBar = () => {
    const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <nav className="bg-white border-b-2">
            {/* Desktop Menu */}
            <div className="hidden md:flex justify-between items-center py-2 px-4">
                <div className="flex-1" />
                <div className="flex items-center justify-center flex-1">
                    {/*<Image src="" alt="Brand Icon" width={50} height={50} />*/}
                    <Icon name='Herba' width={'375'} height={'175'} className='herbaIcon' />

                </div>
                <div className="flex items-center justify-end flex-1 gap-4">
                    <Link href="/account">
                        <Icon name='Account' width={'40'} height={'40'} className='accountIcon' />
                    </Link>
                    <Link href="/cart">
                        <Icon name='Cart' width={'40'} height={'40'} className='cartIcon' />
                    </Link>
                </div>
            </div>
            <hr className="hidden md:block" />
            <ul className="hidden md:flex justify-evenly py-2">
                {navLinks.map((link) => (
                    <li key={link.href}>
                        <Link href={link.href}>
                            <span className=" uppercase font-semibold text-primary hover:text-secondary transition duration-300">{link.label}</span>
                        </Link>
                    </li>
                ))}
            </ul>

            {/* Mobile Menu */}
            <div className="md:hidden  flex justify-between items-center py-2 px-4">
                <Image src="/path-to-brand-icon.png" alt="Brand Icon" width={50} height={50} />
                <button aria-label='menu-icon' type='button' onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}>
                    <Image src="/path-to-menu-icon.png" alt="Menu" width={24} height={24} />
                </button>
            </div>

            {isMobileMenuOpen && (
                <ul className="md:hidden">
                    {navLinks.map((link) => (
                        <li key={link.href} className="border-t border-gray-200">
                            <Link href={link.href}>
                                <span className="block p-4 text-sm uppercase font-semibold text-primary hover:primary-variant">
                                    {link.label}
                                </span>
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
     
        </nav>
    );
};

export default NavBar;
