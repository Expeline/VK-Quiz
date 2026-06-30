import { useNavigate } from "react-router-dom";
import { createQuiz } from "../../../../api/quizApi";
import { useLanguage } from "../../../../hooks/useLanguage";
import DashboardPanel from "../../components/DashboardPanel";
import QuizBuilder from "./QuizBuilder";

function CreateQuiz() {
    const navigate = useNavigate();
    const { t } = useLanguage();

    const handleSubmit = async (payload) => {
        await createQuiz(payload);
        navigate("/dashboard/organizer/quizzes");
    };

    return (
        <DashboardPanel
            title={t("quiz.createTitle")}
            subtitle={t("quiz.createSubtitle")}
        >
            <QuizBuilder onSubmit={handleSubmit} submitLabel={t("quiz.saveQuiz")} />
        </DashboardPanel>
    );
}

export default CreateQuiz;
