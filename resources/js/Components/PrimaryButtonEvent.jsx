export default function PrimaryButtonEvent({ className = '', disabled, children, onClick }) {
    return (
        <button
            onClick={() => { onClick() }}
            className={
                `self-center px-4 py-2 bg-op-primary hover:bg-op-primary-effect text-white rounded h-min transition ease-in-out duration-150 ${
                    disabled && 'opacity-25'
                } ` + className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}
