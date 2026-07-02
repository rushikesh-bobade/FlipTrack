import { useState, useEffect } from "react";
import { useLoaderData, useActionData } from "react-router";
import type { Route } from "./+types/expenses-tracker";
import { toast } from "sonner";
import { getSupabaseServerClient } from "~/utils/supabase.server";
import { PrismaClient } from "@prisma/client";
import styles from "./expenses-tracker.module.css";
import { ExpensesHeader } from "~/blocks/expenses-tracker/expenses-header";
import { RecurringExpensesSection } from "~/blocks/expenses-tracker/recurring-expenses-section";
import { OneTimeExpensesTable } from "~/blocks/expenses-tracker/one-time-expenses-table";
import { ExpensesSummary } from "~/blocks/expenses-tracker/expenses-summary";
import { AddExpenseModal } from "~/blocks/expenses-tracker/add-expense-modal";
import { Pagination } from "~/blocks/__global/pagination";

const prisma = new PrismaClient();

export async function loader({ request }: Route.LoaderArgs) {
  const { supabase } = getSupabaseServerClient(request);
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { expenses: [], recurring: [], totalPages: 0, oneTimeTotal: 0 };

  const url = new URL(request.url);
  const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
  const pageSize = Number(url.searchParams.get("pageSize")) || 10;

  const [totalExpenses, expenses, recurring, sumResult] = await Promise.all([
    prisma.expense.count({ where: { userId: user.id } }),
    prisma.expense.findMany({
      where: { userId: user.id },
      orderBy: { date: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.recurringExpense.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    }),
    prisma.expense.aggregate({
      where: { userId: user.id },
      _sum: { amount: true }
    })
  ]);

  return {
    expenses: expenses.map(e => ({ ...e, amount: Number(e.amount) })),
    recurring: recurring.map(r => ({ ...r, amount: Number(r.amount) })),
    totalPages: Math.ceil(totalExpenses / pageSize),
    oneTimeTotal: Number(sumResult._sum.amount || 0)
  };
}

export async function action({ request }: Route.ActionArgs) {
  const { supabase } = getSupabaseServerClient(request);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "toggle") {
    const id = formData.get("id") as string;
    const isActive = formData.get("isActive") === "true";

    await prisma.recurringExpense.updateMany({
      where: {
        id,
        userId: user.id
      },
      data: {
        isActive,
      },
    });
    return { ok: true, intent };
  }

  if (intent === "create") {
    const isRecurring = formData.get("isRecurring") === "on";
    const type = formData.get("type") as any;
    const amount = Number(formData.get("amount"));
    const description = formData.get("description") as string;
    const date = formData.get("date") ? new Date(formData.get("date") as string) : new Date();

    if (isRecurring) {
      const dayOfMonth = Number(formData.get("dayOfMonth")) || 1;
      await prisma.recurringExpense.create({
        data: {
          userId: user.id,
          type,
          amount,
          description,
          dayOfMonth,
          isActive: true
        }
      });
    } else {
      await prisma.expense.create({
        data: {
          userId: user.id,
          type,
          amount,
          description,
          date,
        }
      });
    }
  }

  if (intent === "update") {
    const id = formData.get("id") as string;
    const type = formData.get("type") as any;
    const amount = Number(formData.get("amount"));
    const description = formData.get("description") as string;
    const date = formData.get("date") ? new Date(formData.get("date") as string) : new Date();

    await prisma.expense.update({
      where: { id, userId: user.id },
      data: { type, amount, description, date },
    });

    return { ok: true, intent: "update" };
  }

  if (intent === "delete") {
    const id = formData.get("id") as string;
    await prisma.expense.delete({
      where: { id, userId: user.id },
    });
    
    return { ok: true, intent: "delete" };
  }
}

export default function ExpensesTrackerPage() {
  const { expenses, recurring, totalPages, oneTimeTotal } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [editingExpense, setEditingExpense] = useState<any>(null);

  useEffect(() => {
    if (actionData?.ok) {
      if (actionData.intent === "create") {
        toast.success("Expense added successfully");
        setShowAddExpense(false);
      }
      if (actionData.intent === "update") {
        toast.success("Expense updated successfully");
        setEditingExpense(null);
      }
      if (actionData.intent === "delete") {
        toast.success("Expense deleted successfully");
      }
    }
  }, [actionData]);

  return (
    <div className={styles.page}>
      <ExpensesHeader onAddExpense={() => setShowAddExpense(true)} />
      <ExpensesSummary expenses={expenses} recurring={recurring} oneTimeTotal={oneTimeTotal} />
      <RecurringExpensesSection recurring={recurring} />
      <OneTimeExpensesTable
        expenses={expenses}
        onEdit={(expense) => setEditingExpense(expense)}
      />
      <Pagination totalPages={totalPages} />
      {showAddExpense && <AddExpenseModal onClose={() => setShowAddExpense(false)} />}
      {editingExpense && (
        <AddExpenseModal
          expense={editingExpense}
          onClose={() => setEditingExpense(null)}
        />
      )}
    </div>
  );
}