
export default function NavButton({ children, onClick }) {

    return (
        <button onClick={() => onClick()} type="button" className="self-center px-2 py-2 bg-op-primary hover:bg-op-primary-effect text-white rounded h-min">
            { children }
        </button>
    )

}
