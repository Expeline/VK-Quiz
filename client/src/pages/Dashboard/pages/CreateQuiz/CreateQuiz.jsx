import { useNavigate } from "react-router-dom";
import { createQuiz } from "../../../../api/quizApi";
import DashboardPanel from "../../components/DashboardPanel";
import QuizBuilder from "./QuizBuilder";

function CreateQuiz() {
    const navigate = useNavigate();

    const handleSubmit = async (payload) => {
        await createQuiz(payload);
        navigate("/dashboard/organizer/quizzes");
    };

    return (
        <DashboardPanel
            title="Создать квиз"
            subtitle="Задайте параметры квиза, добавьте вопросы, варианты ответов и отметьте правильные ответы."
        >
            <QuizBuilder onSubmit={handleSubmit} submitLabel="Сохранить квиз" />
        </DashboardPanel>
    );
}

export default CreateQuiz;
