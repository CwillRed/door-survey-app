import type { ReactNode } from 'react';

type SurveyCardProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

export function SurveyCard({ title, description, children }: SurveyCardProps) {
  return (
    <section className="survey-card">
      <div className="survey-card__header">
        <h2>{title}</h2>
        {description ? <p>{description}</p> : null}
      </div>
      <div className="survey-card__content">{children}</div>
    </section>
  );
}
