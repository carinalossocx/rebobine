export default function ThemeScript() {
  const themeScript = `
    (function() {
      document.documentElement.classList.add('dark');
    })()
  `;

  return (
    <script
      dangerouslySetInnerHTML={{ __html: themeScript }}
      suppressHydrationWarning
    />
  );
}
