import { useState, useEffect, Suspense } from "react";
import { useLoaderData, useActionData, Await } from "react-router";
import type { Route } from "./+types/expenses-tracker";
import { toast } from "sonner";
import { getSupabaseServerClient, getUserFromRequest } from "~/utils/supabase.server";
import { PrismaClient } from "@prisma/client";
import styles from "./expenses-tracker.module.css";
import { ExpensesHeader } from "~/blocks/expenses-tracker/expenses-header";
import { RecurringExpensesSection } from "~/blocks/expenses-tracker/recurring-expenses-section";
import { OneTimeExpensesTable } from "~/blocks/expenses-tracker/one-time-expenses-table";
import { ExpensesSummary } from "~/blocks/expenses-tracker/expenses-summary";
import { AddExpenseModal } from "~/blocks/expenses-tracker/add-expense-modal";
import { Pagination } from "~/blocks/__global/pagination";
import { CACHE_PRIVATE_NO_STORE } from "~/utils/cache-headers";
import { IconLoader2 } from "@tabler/icons-react";

export function headers(_: Route.HeadersArgs) {
  return {
    "Cache-Control": CACHE_PRIVATE_NO_STORE,
  };
}

const prisma = new PrismaClient();

// Columns the user is allowed to sort by (per issue #33).
const ALLOWED_SORT = ["date", "amount"] as const;

export async function loader({ request }: Route.LoaderArgs) {
  const { supabase } = getSupabaseServerClient(request);
  const {
    data: { user },
  } = await getUserFromRequest(request, supabase);

  const url = new URL(request.url);

  // Sort state lives in the URL so the DB can order across ALL pages,
  // not just the rows on the current page.
  const sortParam = url.searchParams.get("sort") || "date";
  const sort = (ALLOWED_SORT as readonly string[]).includes(sortParam) ? sortParam : "date";
  const dir = url.searchParams.get("dir") === "asc" ? "asc" : "desc";

  if (!user) return {
    sort,
    dir,
    deferredData: Promise.resolve({
      expenses: [] as any[],
      recurring: [] as any[],
      totalPages: 0,
      oneTimeTotal: 0,
    }),
  };

  const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
  const pageSize = Number(url.searchParams.get("pageSize")) || 10;

<<<<<<< HEAD
  const countPromise = prisma.expense.count({ where: { userId: user.id } });
  const expensesPromise = prisma.expense.findMany({
    where: { userId: user.id },
    orderBy: { [sort]: dir },
    skip: (page - 1) * pageSize,
    take: pageSize,
  }).then((expenses) =>
    expenses.map((e) => ({ ...e, amount: Number(e.amount) }))
  );

  const recurringPromise = prisma.recurringExpense.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  }).then((recurring) =>
    recurring.map((r) => ({ ...r, amount: Number(r.amount) }))
  );

  const aggregatePromise = prisma.expense.aggregate({
    where: { userId: user.id },
    _sum: { amount: true },
  });

  const deferredData = Promise.all([countPromise, expensesPromise, recurringPromise, aggregatePromise]).then(
    ([totalExpenses, formattedExpenses, formattedRecurring, sumResult]) => ({
      expenses: formattedExpenses,
      recurring: formattedRecurring,
      totalPages: Math.ceil(totalExpenses / pageSize),
      oneTimeTotal: Number(sumResult._sum.amount || 0),
    })
  );

  return { sort, dir, deferredData };
=======
  const allowedSort = ["date", "amount", "description", "type"];
  const sortParam = url.searchParams.get("sort") || "date";
  const sort = allowedSort.includes(sortParam) ? sortParam : "date";
  const dir = url.searchParams.get("dir") === "asc" ? "asc" : "desc";

  const [totalExpenses, expenses, recurring, sumResult] = await Promise.all([
    prisma.expense.count({ where: { userId: user.id } }),
    prisma.expense.findMany({
      where: { userId: user.id },
      orderBy: { [sort]: dir },
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
    expenses,
    recurring,
    totalPages: Math.ceil(totalExpenses / pageSize),
    oneTimeTotal: Number(sumResult._sum.amount || 0),
    sort,
    dir,
  };
>>>>>>> f5967292ba6c6e97c4ba8491bb16a13146eb78a0
}

export async function action({ request }: Route.ActionArgs) {
  const { supabase } = getSupabaseServerClient(request);
  const {
    data: { user },
  } = await getUserFromRequest(request, supabase);

  if (!user) return new Response("Unauthorized", { status: 401 });

  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "toggle") {
    const id = formData.get("id") as string;
    const isActive = formData.get("isActive") === "true";

    await prisma.recurringExpense.updateMany({
      where: {
        id,
        userId: user.id,
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
<<<<<<< HEAD
        data: {
          userId: user.id,
          type,
          amount,
          description,
          dayOfMonth,
          isActive: true,
        },
      });
    } else {
      await prisma.expense.create({
        data: {
          userId: user.id,
          type,
          amount,
          description,
          date,
        },
=======
        data: { userId: user.id, type, amount, description, dayOfMonth, isActive: true }
      });
    } else {
      await prisma.expense.create({
        data: { userId: user.id, type, amount, description, date }
>>>>>>> f5967292ba6c6e97c4ba8491bb16a13146eb78a0
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
  const { deferredData, sort, dir } = useLoaderData<typeof loader>();
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
<<<<<<< HEAD
      <Suspense
        fallback={
          <div className={styles.loadingContainer}>
            <IconLoader2 size={32} className={styles.spin} />
            <span>Loading expenses data...</span>
          </div>
        }
      >
        <Await resolve={deferredData}>
          {({ expenses, recurring, totalPages, oneTimeTotal }) => (
            <>
              <ExpensesSummary expenses={expenses} recurring={recurring} oneTimeTotal={oneTimeTotal} />
              <RecurringExpensesSection recurring={recurring} />
              <OneTimeExpensesTable
                expenses={expenses}
                sort={sort as "date" | "amount"}
                dir={dir as "asc" | "desc"}
                onEdit={(expense) => setEditingExpense(expense)}
              />
              <Pagination totalPages={totalPages} />
            </>
          )}
        </Await>
      </Suspense>
=======
      <ExpensesSummary expenses={expenses} recurring={recurring} oneTimeTotal={oneTimeTotal} />
      <RecurringExpensesSection recurring={recurring} />
      <OneTimeExpensesTable expenses={expenses} sort={sort} dir={dir} />
      <Pagination totalPages={totalPages} />
>>>>>>> f5967292ba6c6e97c4ba8491bb16a13146eb78a0
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
