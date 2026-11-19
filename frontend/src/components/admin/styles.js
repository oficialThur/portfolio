export const inputClass =
  "h-11 w-full rounded-md border border-control bg-transparent px-3.5 py-2.5 text-body-md text-text-primary placeholder:text-text-muted transition-colors duration-200 focus:border-text-muted";

export const textareaClass = `${inputClass} h-auto min-h-[132px] resize-y`;

export const labelClass =
  "mb-2 block font-mono text-label-md uppercase text-text-muted";

export const errorClass = "font-mono text-label-md text-danger";

export const successClass = "font-mono text-label-md text-success";

export const buttonPrimary =
  "inline-flex h-11 min-h-11 cursor-pointer items-center justify-center rounded-md bg-white px-5 font-mono text-label-md uppercase text-ink transition-opacity duration-200 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 md:h-10";

export const buttonGhost =
  "inline-flex h-11 min-h-11 cursor-pointer items-center justify-center rounded-md border border-control bg-transparent px-5 font-mono text-label-md uppercase text-text-muted transition-colors duration-200 hover:border-text-muted hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-60 md:h-10";

export const buttonDanger =
  "inline-flex h-11 min-h-11 cursor-pointer items-center justify-center rounded-md border border-danger bg-transparent px-5 font-mono text-label-md uppercase text-danger transition-opacity duration-200 hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-60 md:h-10";

export const dialogClass =
  "admin-dialog m-auto w-[calc(100%-2rem)] max-w-[560px] max-h-[min(720px,calc(100dvh-2rem))] overflow-y-auto rounded-md border border-border bg-background p-8 text-text-primary max-md:h-dvh max-md:w-full max-md:max-w-none max-md:rounded-none max-md:p-6";
