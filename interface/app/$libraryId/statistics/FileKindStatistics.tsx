import { ArrowLeft, ArrowRight } from '@phosphor-icons/react';
import { getIcon } from '@sd/assets/util';
import clsx from 'clsx';
import { motion } from 'framer-motion';
import { RefObject, useEffect, useRef, useState } from 'react';
import { useDraggable } from 'react-use-draggable-scroll';
import { formatNumber, ObjectKind, ObjectKindEnum, useLibraryQuery } from '@sd/client';
import { tw } from '@sd/ui';
import { Icon } from '~/components';
import { useIsDark, useShowControls } from '~/hooks';

import { useLayoutContext } from '../Layout/Context';
import { usePageLayoutContext } from '../PageLayout/Context';

const ArrowButton = tw.div`absolute top-1/2 z-40 flex h-8 w-8 shrink-0 -translate-y-1/2 items-center p-2 cursor-pointer justify-center rounded-full border border-app-line bg-app/50 hover:opacity-95 backdrop-blur-md transition-all duration-200`;

export default () => {
	const isDark = useIsDark();
	const { ref: pageRef } = usePageLayoutContext();

	const ref = useRef<HTMLDivElement>(null);
	const { events } = useDraggable(ref as React.MutableRefObject<HTMLDivElement>);
	const [lastItemVisible, setLastItemVisible] = useState(false);
	const transparentBg = useShowControls().transparentBg;

	const { scroll, mouseState } = useMouseHandlers({ ref });

	const kinds = useLibraryQuery(['library.kindStatistics']);

	// ObjectKind
	const kindList = Object.values(ObjectKind);

	const handleArrowOnClick = (direction: 'right' | 'left') => {
		const element = ref.current;
		if (!element) return;

		element.scrollTo({
			left: direction === 'left' ? element.scrollLeft + 200 : element.scrollLeft - 200,
			behavior: 'smooth'
		});
	};
	const lastItemVisibleHandler = (index: number) => {
		index === kindList.length - 1 && setLastItemVisible((prev) => !prev);
	};

	const maskImage = `linear-gradient(90deg, transparent 0.1%, rgba(0, 0, 0, 1) ${
		scroll > 0 ? '10%' : '0%'
	}, rgba(0, 0, 0, 1) ${lastItemVisible ? '95%' : '85%'}, transparent 99%)`;

	return (
		<div className={clsx('relative mb-4 flex pb-2 pt-5', !transparentBg && 'bg-app/90')}>
			<ArrowButton
				onClick={() => handleArrowOnClick('right')}
				className={clsx('left-3', scroll === 0 && 'pointer-events-none opacity-0')}
			>
				<ArrowLeft weight="bold" className="h-4 w-4 text-ink" />
			</ArrowButton>
			<div
				ref={ref}
				{...events}
				className="no-scrollbar flex space-x-px overflow-x-scroll pr-[60px]"
				style={{
					WebkitMaskImage: maskImage, // Required for Chromium based browsers
					maskImage
				}}
			>
				{kinds.data?.statistics
					?.sort((a, b) => b.count - a.count)
					.map(({ kind, name, count }) => {
						let icon = name;
						switch (name) {
							case 'Code':
								icon = 'Terminal';
								break;
							case 'Unknown':
								icon = 'Undefined';
								break;
						}
						return (
							<motion.div
								onViewportEnter={() => lastItemVisibleHandler(kind)}
								onViewportLeave={() => lastItemVisibleHandler(kind)}
								viewport={{
									root: ref,
									// WARNING: Edge breaks if the values are not postfixed with px or %
									margin: '0% -120px 0% 0%'
								}}
								className={clsx(
									'min-w-fit',
									mouseState !== 'dragging' && '!cursor-default'
								)}
								key={kind}
							>
								<KindItem
									name={name}
									icon={icon}
									items={count}
									onClick={() => {}}
								/>
							</motion.div>
						);
					})}
			</div>
			<ArrowButton
				onClick={() => handleArrowOnClick('left')}
				className={clsx('right-3', lastItemVisible && 'pointer-events-none opacity-0')}
			>
				<ArrowRight weight="bold" className="h-4 w-4 text-ink" />
			</ArrowButton>
		</div>
	);
};

interface KindItemProps {
	name: string;
	items: number;
	icon: string;
	selected?: boolean;
	onClick?: () => void;
	disabled?: boolean;
}

const KindItem = ({ name, icon, items, selected, onClick, disabled }: KindItemProps) => {
	return (
		<div
			onClick={onClick}
			className={clsx(
				'flex shrink-0 items-center rounded-lg px-1.5 py-1 text-sm outline-none focus:bg-app-selectedItem/50',
				selected && 'bg-app-selectedItem',
				disabled && 'cursor-not-allowed opacity-30'
			)}
		>
			<Icon name={icon as any} className="mr-3 h-12 w-12" />
			<div className="pr-5">
				<h2 className="text-sm font-medium">{name}</h2>
				{items !== undefined && (
					<p className="text-xs text-ink-faint">
						{formatNumber(items)} Item{(items > 1 || items === 0) && 's'}
					</p>
				)}
			</div>
		</div>
	);
};

const useMouseHandlers = ({ ref }: { ref: RefObject<HTMLDivElement> }) => {
	const layout = useLayoutContext();

	const [scroll, setScroll] = useState(0);

	type MouseState = 'idle' | 'mousedown' | 'dragging';
	const [mouseState, setMouseState] = useState<MouseState>('idle');

	useEffect(() => {
		const element = ref.current;
		if (!element) return;

		const onScroll = () => {
			setScroll(element.scrollLeft);

			setMouseState((s) => {
				if (s !== 'mousedown') return s;

				if (layout.ref.current) layout.ref.current.style.cursor = 'grabbing';

				return 'dragging';
			});
		};
		const onWheel = (event: WheelEvent) => {
			event.preventDefault();
			const { deltaX, deltaY } = event;
			const scrollAmount = Math.abs(deltaX) > Math.abs(deltaY) ? deltaX : deltaY;
			element.scrollTo({ left: element.scrollLeft + scrollAmount });
		};
		const onMouseDown = () => setMouseState('mousedown');

		const onMouseUp = () => {
			setMouseState('idle');
			if (layout.ref.current) {
				layout.ref.current.style.cursor = '';
			}
		};

		element.addEventListener('scroll', onScroll);
		element.addEventListener('wheel', onWheel);
		element.addEventListener('mousedown', onMouseDown);

		window.addEventListener('mouseup', onMouseUp);

		return () => {
			element.removeEventListener('scroll', onScroll);
			element.removeEventListener('wheel', onWheel);
			element.removeEventListener('mousedown', onMouseDown);

			window.removeEventListener('mouseup', onMouseUp);
		};
	}, [ref, layout.ref]);

	return { scroll, mouseState };
};