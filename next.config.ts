import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

export default withNextIntl({
  eslint: {
    ignoreDuringBuilds: true,
  },
});
