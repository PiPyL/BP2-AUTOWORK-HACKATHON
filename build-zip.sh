#!/usr/bin/env bash
# =============================================================================
# build-zip.sh — BurgerStudio AI Chrome Extension Package Builder
# =============================================================================
# Tạo file ZIP sẵn sàng để cài đặt thủ công hoặc upload lên Chrome Web Store.
# Chỉ bao gồm các file cần thiết cho extension, loại bỏ file phát triển.
#
# Cách dùng:
#   chmod +x build-zip.sh   # (lần đầu)
#   ./build-zip.sh
#
# Output:
#   dist/burgerstudio-ai-v<VERSION>.zip
# =============================================================================

set -euo pipefail

# ─────────────────────────── CẤU HÌNH ───────────────────────────────────────

# Thư mục gốc của dự án (tự động lấy vị trí script này)
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Thư mục output
DIST_DIR="$PROJECT_DIR/dist"

# Đọc version từ manifest.json
VERSION=$(grep '"version"' "$PROJECT_DIR/manifest.json" | sed 's/.*"version": *"\([^"]*\)".*/\1/')

# Tên file ZIP output (có version — để lưu trữ lịch sử)
ZIP_NAME="burgerstudio-ai-v${VERSION}.zip"
ZIP_PATH="$DIST_DIR/$ZIP_NAME"

# Tên file ZIP tĩnh (dùng cho GitHub Releases download link)
ZIP_STATIC_NAME="burger-mockup-extension.zip"
ZIP_STATIC_PATH="$DIST_DIR/$ZIP_STATIC_NAME"

# ─────────────────── CÁC FILE & FOLDER CẦN BAO GỒM ─────────────────────────
# Chỉ những thứ này mới được đưa vào ZIP.
# Dựa trên manifest.json của dự án.

INCLUDE_ITEMS=(
  "manifest.json"      # Bắt buộc — cấu hình extension
  "background/"        # Service Worker
  "content/"           # Content scripts & CSS
  "sidepanel/"         # Side Panel UI
  "offscreen/"         # Offscreen document (nếu có)
  "icons/"             # Icons (16, 48, 128)
  "_locales/"          # i18n translations
)

# ─────────────────── CÁC PATTERN CẦN LOẠI TRỪ ──────────────────────────────
# Những file/folder này sẽ KHÔNG được đưa vào ZIP dù nằm trong INCLUDE_ITEMS.

EXCLUDE_PATTERNS=(
  "*.map"              # Source maps (không cần thiết khi deploy)
  "*.md"               # Markdown docs
  ".DS_Store"          # macOS metadata
  "Thumbs.db"          # Windows metadata
  "*.log"              # Log files
  "__pycache__/"       # Python cache
  "node_modules/"      # Dependencies (không đóng gói)
  ".git/"              # Git history
  ".vscode/"           # VSCode settings
  ".idea/"             # IntelliJ settings
  "*.test.js"          # Unit tests
  "*.spec.js"          # Spec tests
  "tests/"             # Test folder
  "__tests__/"         # Jest tests
  ".env"               # Secrets
  ".env.*"             # Các file env
  "*.pem"              # Certificates
  "*.key"              # Private keys
)

# ─────────────────── MÀU SẮC CHO OUTPUT ────────────────────────────────────

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# ─────────────────── HÀM TIỆN ÍCH ──────────────────────────────────────────

print_header() {
  echo ""
  echo -e "${BOLD}${BLUE}╔══════════════════════════════════════════════════╗${NC}"
  echo -e "${BOLD}${BLUE}║   🍔 BurgerStudio AI — Extension Packager        ║${NC}"
  echo -e "${BOLD}${BLUE}╚══════════════════════════════════════════════════╝${NC}"
  echo ""
}

print_step() {
  echo -e "${CYAN}▶ $1${NC}"
}

print_success() {
  echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
  echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
  echo -e "${RED}❌ $1${NC}"
}

print_info() {
  echo -e "   ${YELLOW}$1${NC}"
}

# ─────────────────── KIỂM TRA ĐIỀU KIỆN ────────────────────────────────────

check_requirements() {
  print_step "Kiểm tra yêu cầu..."

  if ! command -v zip &>/dev/null; then
    print_error "Không tìm thấy lệnh 'zip'. Hãy cài đặt: brew install zip"
    exit 1
  fi

  if [[ ! -f "$PROJECT_DIR/manifest.json" ]]; then
    print_error "Không tìm thấy manifest.json trong: $PROJECT_DIR"
    exit 1
  fi

  print_success "Tất cả yêu cầu đã đáp ứng"
}

# ─────────────────── KIỂM TRA FILE TỒN TẠI ─────────────────────────────────

check_include_items() {
  print_step "Kiểm tra các file/folder cần đóng gói..."

  local missing=0
  for item in "${INCLUDE_ITEMS[@]}"; do
    local full_path="$PROJECT_DIR/${item%/}"  # Loại bỏ trailing slash để test
    if [[ -e "$full_path" ]]; then
      print_info "✓ $item"
    else
      print_warning "Không tìm thấy: $item (sẽ bỏ qua)"
      missing=$((missing + 1))
    fi
  done

  if [[ $missing -gt 0 ]]; then
    echo ""
    print_warning "$missing item(s) không tìm thấy và sẽ bị bỏ qua"
  fi
}

# ─────────────────── XÂY DỰNG FILE ZIP ─────────────────────────────────────

build_zip() {
  print_step "Chuẩn bị thư mục output: dist/"

  # Tạo thư mục dist nếu chưa có
  mkdir -p "$DIST_DIR"

  # Xóa file ZIP cũ nếu tồn tại
  if [[ -f "$ZIP_PATH" ]]; then
    rm -f "$ZIP_PATH"
    print_info "Đã xóa file ZIP cũ: $ZIP_NAME"
  fi

  print_step "Đóng gói extension..."

  # Xây dựng lệnh zip với các exclude patterns
  local zip_cmd=("zip" "-r" "$ZIP_PATH")

  # Thêm từng item cần include (chỉ nếu tồn tại)
  local included_count=0
  for item in "${INCLUDE_ITEMS[@]}"; do
    local full_path="$PROJECT_DIR/${item%/}"
    if [[ -e "$full_path" ]]; then
      zip_cmd+=("$item")
      included_count=$((included_count + 1))
    fi
  done

  # Thêm các pattern exclude
  for pattern in "${EXCLUDE_PATTERNS[@]}"; do
    zip_cmd+=("-x" "*/$pattern")
    zip_cmd+=("-x" "$pattern")
  done

  # Chạy lệnh zip từ thư mục dự án
  cd "$PROJECT_DIR"
  "${zip_cmd[@]}" > /dev/null 2>&1

  if [[ $? -eq 0 ]]; then
    print_success "Đóng gói thành công!"
  else
    print_error "Đóng gói thất bại!"
    exit 1
  fi

  # Tạo bản alias tên tĩnh cho GitHub Releases
  print_step "Tạo file alias cho GitHub Releases: $ZIP_STATIC_NAME"
  cp "$ZIP_PATH" "$ZIP_STATIC_PATH"
  print_success "Đã tạo: dist/$ZIP_STATIC_NAME"
}

# ─────────────────── IN THÔNG TIN KẾT QUẢ ──────────────────────────────────

print_result() {
  local file_size
  file_size=$(du -sh "$ZIP_PATH" | cut -f1)
  local file_count
  file_count=$(unzip -l "$ZIP_PATH" 2>/dev/null | tail -1 | awk '{print $2}')

  echo ""
  echo -e "${BOLD}${GREEN}╔══════════════════════════════════════════════════╗${NC}"
  echo -e "${BOLD}${GREEN}║   📦 Đóng gói hoàn tất!                         ║${NC}"
  echo -e "${BOLD}${GREEN}╠══════════════════════════════════════════════════╣${NC}"
  echo -e "${BOLD}${GREEN}║${NC}  📄 Versioned : ${BOLD}$ZIP_NAME${NC}"
  echo -e "${BOLD}${GREEN}║${NC}  🔗 Release   : ${BOLD}$ZIP_STATIC_NAME${NC}"
  echo -e "${BOLD}${GREEN}║${NC}  📁 Vị trí    : ${CYAN}dist/${NC}"
  echo -e "${BOLD}${GREEN}║${NC}  📊 Kích thước: ${YELLOW}${file_size}B${NC}"
  echo -e "${BOLD}${GREEN}║${NC}  🗂️  Số file  : ${YELLOW}${file_count} files${NC}"
  echo -e "${BOLD}${GREEN}╠══════════════════════════════════════════════════╣${NC}"
  echo -e "${BOLD}${GREEN}║${NC}  🚀 Upload file sau lên GitHub Release:         ${BOLD}${GREEN}║${NC}"
  echo -e "${BOLD}${GREEN}║${NC}  dist/$ZIP_STATIC_NAME          ${BOLD}${GREEN}║${NC}"
  echo -e "${BOLD}${GREEN}╠══════════════════════════════════════════════════╣${NC}"
  echo -e "${BOLD}${GREEN}║${NC}  💡 Cách cài đặt thủ công:                      ${BOLD}${GREEN}║${NC}"
  echo -e "${BOLD}${GREEN}║${NC}  1. Mở Chrome → chrome://extensions            ${BOLD}${GREEN}║${NC}"
  echo -e "${BOLD}${GREEN}║${NC}  2. Bật \"Developer mode\"                       ${BOLD}${GREEN}║${NC}"
  echo -e "${BOLD}${GREEN}║${NC}  3. Kéo thả file ZIP vào trang này             ${BOLD}${GREEN}║${NC}"
  echo -e "${BOLD}${GREEN}╚══════════════════════════════════════════════════╝${NC}"
  echo ""
}

# ─────────────────── IN DANH SÁCH FILE TRONG ZIP ────────────────────────────

print_zip_contents() {
  print_step "Nội dung file ZIP:"
  echo ""
  unzip -l "$ZIP_PATH" 2>/dev/null | head -50
  echo ""
}

# ─────────────────── MAIN ───────────────────────────────────────────────────

main() {
  print_header

  echo -e "  ${BOLD}Phiên bản:${NC} ${YELLOW}v${VERSION}${NC}"
  echo -e "  ${BOLD}Dự án:${NC}    ${CYAN}$PROJECT_DIR${NC}"
  echo -e "  ${BOLD}Output:${NC}   ${CYAN}$ZIP_PATH${NC}"
  echo ""

  check_requirements
  check_include_items
  build_zip
  print_zip_contents
  print_result
}

main "$@"
