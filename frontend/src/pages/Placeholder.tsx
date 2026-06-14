import { MainLayout } from "../routes/MainLayout";
import { Card } from "../shared/ui/Card";

interface PlaceholderProps {
  title: string;
  description: string;
}

export function Placeholder({ title, description }: PlaceholderProps) {
  return (
    <MainLayout>
      <Card className="p-12 text-center">
        <h1 className="text-3xl font-bold text-foreground mb-3">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </Card>
    </MainLayout>
  );
}
