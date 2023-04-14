import { Link } from '@inertiajs/react';

export default function NavButton({ children }) {

    return (
        <Link className="self-center px-2 py-2 bg-op-primary hover:bg-op-primary-effect text-white rounded h-min">
            { children }
        </Link>
    )

}
