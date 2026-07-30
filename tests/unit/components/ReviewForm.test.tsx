import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ReviewForm } from "@/components/ReviewForm";

describe("ReviewForm", () => {
  it("renders score slider with current value", () => {
    render(
      <ReviewForm
        initialScore={7.5}
        initialReviewText=""
        initialTags={[]}
        locked={false}
        onSubmit={vi.fn()}
      />,
    );

    expect(screen.getByDisplayValue("7.5")).toBeInTheDocument();
    expect(screen.getByText(/7\.5/)).toBeInTheDocument();
  });

  it("updates score badge color when slider changes", () => {
    render(
      <ReviewForm
        initialScore={5}
        initialReviewText=""
        initialTags={[]}
        locked={false}
        onSubmit={vi.fn()}
      />,
    );

    const slider = screen.getByRole("slider");
    fireEvent.change(slider, { target: { value: "9.5" } });

    // Gold badge for 9+
    const badge = screen.getByText(/9\.5/);
    expect(badge.className).toContain("text-accent");
  });

  it("shows yellow badge for score 5-6", () => {
    render(
      <ReviewForm
        initialScore={5}
        initialReviewText=""
        initialTags={[]}
        locked={false}
        onSubmit={vi.fn()}
      />,
    );

    const badge = screen.getByText(/5\.0|5/);
    expect(badge).toBeInTheDocument();
  });

  it("renders review text area", () => {
    render(
      <ReviewForm
        initialScore={7}
        initialReviewText="Great movie!"
        initialTags={[]}
        locked={false}
        onSubmit={vi.fn()}
      />,
    );

    expect(screen.getByDisplayValue("Great movie!")).toBeInTheDocument();
  });

  it("renders tag checkboxes", () => {
    render(
      <ReviewForm
        initialScore={7}
        initialReviewText=""
        initialTags={["rewatch"]}
        locked={false}
        onSubmit={vi.fn()}
      />,
    );

    const rewatchCheckbox = screen.getByLabelText(/rewatch/i);
    expect(rewatchCheckbox).toBeChecked();
  });

  it("calls onSubmit with score, review text, and tags", () => {
    const onSubmit = vi.fn();
    render(
      <ReviewForm
        initialScore={7}
        initialReviewText=""
        initialTags={[]}
        locked={false}
        onSubmit={onSubmit}
      />,
    );

    const slider = screen.getByRole("slider");
    fireEvent.change(slider, { target: { value: "8.5" } });

    const textarea = screen.getByRole("textbox");
    fireEvent.change(textarea, { target: { value: "Loved it" } });

    const rewatchCheckbox = screen.getByLabelText(/rewatch/i);
    fireEvent.click(rewatchCheckbox);

    const submitButton = screen.getByRole("button", { name: /submit review/i });
    fireEvent.click(submitButton);

    expect(onSubmit).toHaveBeenCalledWith({
      score: 8.5,
      reviewText: "Loved it",
      tags: ["rewatch"],
    });
  });

  it("disables submit button when locked", () => {
    render(
      <ReviewForm
        initialScore={7}
        initialReviewText=""
        initialTags={[]}
        locked={true}
        onSubmit={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: /locked/i })).toBeDisabled();
  });

  it("disables all inputs when locked", () => {
    render(
      <ReviewForm
        initialScore={7}
        initialReviewText="Test"
        initialTags={[]}
        locked={true}
        onSubmit={vi.fn()}
      />,
    );

    expect(screen.getByRole("slider")).toBeDisabled();
    expect(screen.getByRole("textbox")).toBeDisabled();
    expect(screen.getByLabelText(/rewatch/i)).toBeDisabled();
    expect(screen.getByLabelText(/first time/i)).toBeDisabled();
  });

  it("shows 'Update Review' instead of 'Submit Review' when editing existing", () => {
    render(
      <ReviewForm
        initialScore={7}
        initialReviewText="Existing review"
        initialTags={[]}
        locked={false}
        onSubmit={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: /update review/i })).toBeInTheDocument();
  });

  it("shows 'Submit Review' when no existing review text", () => {
    render(
      <ReviewForm
        initialScore={7}
        initialReviewText=""
        initialTags={[]}
        locked={false}
        onSubmit={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: /submit review/i })).toBeInTheDocument();
  });

  it("toggles tags on and off", () => {
    const onSubmit = vi.fn();
    render(
      <ReviewForm
        initialScore={7}
        initialReviewText=""
        initialTags={["rewatch"]}
        locked={false}
        onSubmit={onSubmit}
      />,
    );

    // Uncheck rewatch
    fireEvent.click(screen.getByLabelText(/rewatch/i));
    // Check first time
    fireEvent.click(screen.getByLabelText(/first time/i));

    fireEvent.click(screen.getByRole("button", { name: /submit review/i }));

    expect(onSubmit).toHaveBeenCalledWith({
      score: 7,
      reviewText: "",
      tags: ["first time"],
    });
  });
});
