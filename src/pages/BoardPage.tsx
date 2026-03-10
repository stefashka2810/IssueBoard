import Board from "../features/board/ui/Board.tsx";

const BoardPage = () => {
    return (
        <div className="min-h-screen bg-background">
            <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
                <Board />
            </div>
        </div>
    )
}

export default BoardPage;