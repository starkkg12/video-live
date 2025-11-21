pwtk-web-template-tk01-t_tk005

本プロジェクトは、日本国内の中国語メインの開発現場で運用されているプロジェクトです。

バージョン管理

本プロジェクトは、PWA のバージョン自動管理を実装しており、ビルド時に自動でバージョン情報を生成し、PWA の更新がある場合はユーザーへ通知します。

バージョン番号のルール

基本バージョン：セマンティックバージョニング X.Y.Z（メジャー.マイナー.パッチ）

完全バージョン：X.Y.Z-YYYYMMDD-hash 形式（日付と Git コミットハッシュを付与）

バージョン管理コマンド
# 現在のバージョンを表示
npm run version:show

# 手動でバージョンを更新
npm run version:patch  # パッチ更新 (1.0.0 -> 1.0.1)
npm run version:minor  # マイナー更新 (1.0.0 -> 1.1.0)
npm run version:major  # メジャー更新 (1.0.0 -> 2.0.0)

# コミット履歴から自動で更新区分を判定
npm run version:auto   # 自動判定でバージョン更新

# かんたん更新（パッチ）＋バージョンファイル作成
npm run version:bump   # パッチ更新してバージョンファイルを更新

開発 & ビルド
# 開発環境で起動
npm run dev            # ダークモード
npm run dev:light      # ライトモード
npm run dev:https      # HTTPS 開発モード

# 本番ビルド
npm run build          # ダークモードでビルド
npm run build:light    # ライトモードでビルド

# ワンコマンドでビルド＆バージョン表示
npm run deploy         # ビルドしてバージョン番号を表示

バージョンファイル

開発／ビルド時に version.json が自動生成され、以下の情報を含みます。

{
  "version": "1.0.1",                        // package.json のバージョン
  "fullVersion": "1.0.1-20240710-a1b2c3d",   // 完全バージョン
  "environment": "production",               // 環境（production / development）
  "buildDate": "2024-07-10T12:34:56.789Z",   // ビルド日時
  "buildTimestamp": 1689030000000,           // ビルドのタイムスタンプ
  "git": {                                   // Git 情報
    "hash": "a1b2c3d",                       // コミットハッシュ
    "branch": "main",                        // ブランチ
    "message": "feat: 新機能を追加",          // コミットメッセージ
    "date": "2024-07-10T12:00:00Z",          // コミット日時
    "isDirty": false                         // 未コミットの変更があるか
  }
}

PWA の更新仕組み

Service Worker が新バージョンを検知すると更新ダイアログを表示し、ユーザーが「更新」を押すと最新バージョンへリロードします。
バージョン履歴はローカルストレージに記録され、デバッグモードで確認可能です。
