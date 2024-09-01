'use client';

import { List, X } from '@phosphor-icons/react';
import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ReactNode, useState } from 'react';
import appFullLogo from '~/assets/app_full_logo.svg?url';
import { CtaPrimaryButton } from '~/components/cta-primary-button';

import '~/styles/navbar.css';

import { useCurrentPlatform } from '~/utils/current-platform';
import { ExternalLinkRegex } from '~/utils/regex-external-link';

const NAVIGATION_ITEMS: { label: string; href: string; adornment?: string }[] = [
	{ label: 'Explorer', href: '/' },
	{ label: 'Cloud', href: '/cloud' },
	{ label: 'Teams', href: '/teams' },
	{ label: 'Assistant', href: '/assistant', adornment: 'New' },
	{ label: 'Store', href: '/store' },
	{ label: 'Use Cases', href: '/use-cases' },
	{ label: 'Blog', href: '/blog' },
	{ label: 'Docs', href: '/docs' }
];

export function NavBar() {
	const [isMenuOpen, setIsMenuOpen] = useState(false);

	const currentPlatform = useCurrentPlatform();

	return (
		<>
			{/* Main Navbar */}
			<motion.nav
				className={clsx(
					'fixed top-0 z-[110] mx-4 mt-2 w-[calc(100%-2rem)]',
					'overflow-hidden rounded-xl bg-[#141419]/95 shadow-[0px_-10px_20px_0px_rgba(40,134,213,0.05)] backdrop-blur backdrop-saturate-[1.8]'
				)}
				style={{
					border: '1px rgba(30, 30, 38, 0.00)'
				}}
				initial={{ opacity: 1 }}
				animate={{ opacity: isMenuOpen ? 0 : 1 }}
				transition={{ duration: 0.2 }}
			>
				<div className="noise noise-faded noise-sm flex flex-wrap items-center justify-between gap-x-8 overflow-hidden px-6 py-3">
					{/* Spacedrive Logo and Links */}
					<div className="flex items-center gap-[1.125rem]">
						<Link href="/">
							<Image
								alt="Spacedrive"
								src={appFullLogo}
								width={200}
								height={55}
								className="z-30 mr-[6px] h-[3.5rem] w-auto select-none"
							/>
						</Link>

						<div className="hidden items-center whitespace-nowrap xl:flex">
							{NAVIGATION_ITEMS.map(({ label, href, adornment }) => (
								<NavLink key={`nav-main-${label}-${href}`} href={href}>
									{label} {adornment && <AdornmentBadge />}
								</NavLink>
							))}
						</div>
					</div>

					{/* Download Button */}
					<div className="hidden items-center gap-[20px] xl:flex">
						<CtaPrimaryButton platform={currentPlatform} glow={'sm'} />
					</div>

					{/* List Icon */}
					<div className="flex items-center gap-[20px] xl:hidden">
						<motion.button
							className="block"
							onClick={() => setIsMenuOpen(!isMenuOpen)}
							whileTap={{ rotate: isMenuOpen ? -180 : 180 }}
						>
							<List className="size-6 text-white" />
						</motion.button>
					</div>
				</div>
			</motion.nav>

			{/* Slide-Out Navbar */}
			<AnimatePresence>
				{isMenuOpen && (
					<>
						{/* Background Overlay */}
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 0.5 }}
							exit={{ opacity: 0 }}
							className="fixed left-0 top-0 z-[115] size-full bg-black"
							onClick={() => setIsMenuOpen(false)}
						/>

						{/* Slide-Out Panel */}
						<motion.div
							initial={{ x: '-100%' }}
							animate={{ x: 0 }}
							exit={{ x: '-100%' }}
							transition={{ type: 'spring', stiffness: 300, damping: 30 }}
							className="fixed left-0 top-0 z-[120] h-full w-64 bg-[#141419] p-4 shadow-lg"
						>
							{/* Close Button */}
							<div className="flex justify-end">
								<motion.button
									className="block"
									onClick={() => setIsMenuOpen(false)}
									whileTap={{ rotate: -90 }}
								>
									<X className="size-8 pt-2 text-white" />
								</motion.button>
							</div>

							{/* Nav Links */}
							<div className="flex flex-col items-start space-y-4 p-4">
								{NAVIGATION_ITEMS.map(({ label, href, adornment }) => (
									<NavLink key={`nav-sub-${label}-${href}`} href={href}>
										{label} {adornment && <AdornmentBadge />}
									</NavLink>
								))}
								<CtaPrimaryButton glow={'sm'} platform={currentPlatform} />
							</div>
						</motion.div>
					</>
				)}
			</AnimatePresence>
		</>
	);
}

interface NavLinkProps {
	href: string;
	target?: string;
	children: ReactNode;
}

function NavLink({
	href,
	target = href.match(ExternalLinkRegex)?.length ? '_blank' : undefined,
	children
}: NavLinkProps) {
	return (
		<Link
			href={href ?? '#'}
			target={target}
			className="inline-flex cursor-pointer flex-row items-center justify-center gap-x-1.5 px-2.5 py-2 text-base text-gray-300 no-underline transition hover:text-gray-50"
			rel="noreferrer"
		>
			{children}
		</Link>
	);
}

function AdornmentBadge() {
	return (
		<div className="flex items-center justify-center rounded bg-[#3397EB] px-1 py-0.5 align-middle text-xs font-bold leading-none text-white">
			NEW
		</div>
	);
}