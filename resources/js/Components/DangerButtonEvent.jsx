export default function DangerButtonEvent({ className = '', disabled, children, onClick }) {
    // same as a danger button but has an onClick event attached to it
    return (
        <button
            onClick={() => { onClick() }}
            className={
                `self-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded h-min transition ease-in-out duration-150'
                } ` + className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}
