export const IconType = (typ: string) => {
    return typ == "income" ? (
        <button className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-none hover:bg-green-200 hover:underline"
             title={`type: ${typ}`}
        >
            inc
        </button>
      ) : (
        <button className="bg-pink-100 text-pink-800 text-xs px-2 py-1 rounded-none hover:bg-pink-200 hover:underline" 
             title={`type: ${typ}`}
        >
            exp
        </button>
    );
};