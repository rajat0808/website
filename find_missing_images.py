from build_site import print_validation_report, scan_site


def main() -> int:
    scan = scan_site()
    print_validation_report(scan)
    return 1 if scan.has_errors else 0


if __name__ == "__main__":
    raise SystemExit(main())
