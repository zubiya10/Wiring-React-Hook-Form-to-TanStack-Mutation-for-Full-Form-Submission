
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createThread } from "../services/threadApi";

export default function ThreadForm() {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: "",
      body: "",
    },
  });

  const mutation = useMutation({
    mutationFn: createThread,

    // TODO 3: Refresh the thread list and clear the form.
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["threads"],
      });

      reset();
    },

    // TODO 4: Show server errors inside the form.
    onError: (error) => {
      const serverErrors = error.response?.data?.errors;

      if (serverErrors && Object.keys(serverErrors).length > 0) {
        Object.entries(serverErrors).forEach(([field, message]) => {
          if (field === "title" || field === "body") {
            setError(field, {
              type: "server",
              message,
            });
          }
        });

        // Show a general message if no recognized field error was provided.
        if (
          !serverErrors.title &&
          !serverErrors.body
        ) {
          setError("root.server", {
            type: "server",
            message: "Could not save. Please try again.",
          });
        }
      } else {
        setError("root.server", {
          type: "server",
          message: "Could not save. Please try again.",
        });
      }
    },
  });

  // TODO 1: Submit valid form data through the mutation.
  const onSubmit = (data) => {
    mutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="field">
        <label htmlFor="title">Title</label>

        <input
          id="title"
          {...register("title", {
            required: "Title is required",
          })}
        />

        {errors.title && (
          <p role="alert">{errors.title.message}</p>
        )}
      </div>

      <div className="field">
        <label htmlFor="body">Body</label>

        <textarea
          id="body"
          {...register("body", {
            required: "Body is required",
          })}
        />

        {errors.body && (
          <p role="alert">{errors.body.message}</p>
        )}
      </div>

      {/* Display general server errors */}
      {errors.root?.server && (
        <p role="alert">{errors.root.server.message}</p>
      )}

      {/* TODO 2: Reflect the pending state */}
      <button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? "Creating..." : "Create thread"}
      </button>
    </form>
  );
}
