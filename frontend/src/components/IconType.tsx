export const IconType = (typ: string) => {
    return typ == "income" ? (
        <button className="bg-green-100 text-cyan-600 text-xs px-1 py-1 rounded-none"
             title={`type: ${typ}`}
        >
            in
        </button>
      ) : (
        <button className="bg-pink-100 text-cyan-700 text-xs px-1 py-1 rounded-none" 
             title={`type: ${typ}`}
        >
            ex
        </button>
    );
};