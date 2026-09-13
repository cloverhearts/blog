# CloverHearts Blog

<!-- language-switcher:start -->
**言語を選択**

[English](./README.md) · [한국어](./README.ko.md) · **日本語**
<!-- language-switcher:end -->

コンテンツ、ブログの表示層、独立した管理ページをそれぞれ分離して開発する、
TypeScript ベースの静的ブログです。

採用している技術は Node.js 24.19.0 LTS、npm 11.17.0 ワークスペース、
Astro の静的出力、Zod 4、unified/remark/rehype、Pagefind、Sharp、Vitest、
Playwright、axe-core です。詳細は `IMPLEMENTATION_SPEC.md` と ADR 0004 を参照してください。

英語の README を基準文書とします。翻訳は `README.ko.md` や `README.ja.md` のように、
`README.<language-code>.md` という個別のファイルで管理します。既存の翻訳は同じ変更で
更新し、新しい言語は翻訳ファイルを作成してからすべての README の言語選択欄に追加します。
ドキュメントの対応言語は、ブログの公開言語の設定とは独立しています。

## 概要

このリポジトリは、実行時に検証されるバージョン付きのビルド成果物を中心に設計されています。
コンテンツのソースはブログ UI をインポートせず、ブログ UI も元の Markdown を直接解析しません。
プレビューと本番の出力を構造的に分離し、最終 HTML を処理する専用の段階でサーバー不要の
検索データを生成します。外部コンテンツの埋め込みは、分離されたビルド時のプロバイダー
プラグインを通じて追加できます。

## 現在の状態

ドキュメントに記載されたビルドコマンドは実行可能です。公開記事がない場合でも、言語別の
システムルートと検索エンジン向けファイルを含む本番サイトを `dist/` に組み立てます。
レビュー済みの最初の記事の公開は今後の作業です。レビュー済みの YouTube 埋め込み
プロバイダーは実装されており、サイトはドメイン認証と HTTPS を有効にして
[blog.cloverhearts.com](https://blog.cloverhearts.com/) にデプロイされています。
詳細は [IMPLEMENTATION_STATUS.md](./IMPLEMENTATION_STATUS.md) を参照してください。

目標仕様は [IMPLEMENTATION_SPEC.md](./IMPLEMENTATION_SPEC.md)、各段階の完了条件は
[DEVELOPMENT_PLAN.md](./DEVELOPMENT_PLAN.md) に記載されています。

現在利用できるコマンドは次のとおりです。

```text
npm ci
npm run typecheck
npm run validate:config
npm run validate:embeds
npm run test:contracts
npm run test:policy
npm test
npm run build
npm run dev
```

本番の `build` には `SITE_ORIGIN=https://blog.cloverhearts.com` が必要です。

本番環境には、カスタム GitHub Actions ワークフローによる GitHub Pages を使用します。
Pages ワークフローは検証済みの `dist/` のみを公開します。`docs/` は公開用の Pages
ディレクトリではなく、サイトとして配信しないビルド入力です。正規の本番 URL は
`https://blog.cloverhearts.com` です。`.github/workflows/pages.yml` は `main` への
プッシュ時と手動実行時にデプロイします。品質チェックはルートと `/blog` の構成を
別々のジョブでビルドします。

初回デプロイの前に [リポジトリの Pages 設定](https://github.com/cloverhearts/blog/settings/pages)を
開き、**GitHub Actions** を選択して、カスタムドメインとして **blog.cloverhearts.com** を
保存します。ドメインが使用済みと表示された場合は、既存の Pages との関連付けを解除するか、
先に GitHub のドメイン所有権認証を完了してください。その後、DNS に
`blog` → `cloverhearts.github.io` の CNAME レコードを設定し、証明書が利用可能になったら
**Enforce HTTPS** を有効にします。Actions による公開では、リポジトリ内の `CNAME`
ファイルは不要です。詳細は [GitHub のカスタムドメインガイド](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site)を
参照してください。ローカルのプレビューに表示されていても、下書きの記事やプロフィールは
本番公開から除外されます。

ブログの接頭辞なしの既定言語と JavaScript が使えない場合のフォールバック言語は韓国語です。
英語は `/en/`、日本語は `/ja/` で公開します。ルートへのアクセスのみブラウザーの
優先する対応言語へ移動し、他の URL はその言語を維持します。通常のリンクでも切り替えられ、
韓国語ホームの選択は `/?lang=ko` により Cookie やストレージなしで自動切り替えを防ぎます。
記事へのナビゲーションは、現在の言語、英語、
韓国語の順にリンク先を選びます。

公開コメントは初期リリースの対象外です。コメントプロバイダー、書き込み API、アカウント
システム、モデレーションキュー、コメント用データベースは必要ありません。将来追加する場合は、
プライバシー、セキュリティ、運用コスト、アーキテクチャについて別途決定が必要です。

各言語の記事は、完全な静的 Open Graph 記事情報と記事固有のソーシャル画像を出力する設計です。
検証済みの記事メタデータと承認されたデザインシステムから、ブログのビルドが言語別のカードを
決定論的に生成できるため、元画像は任意です。

ルートの [DESIGN.md](./DESIGN.md) は、通常のブログに適用する Open Design 互換の
ビジュアル仕様です。現在の実装では、白と緑を基調としたエディトリアルレイアウト、ローカルに
同梱した Pretendard Variable、[UX_FLOW.md](./UX_FLOW.md) のフローを使用します。
UX レビューの優先言語は韓国語と英語で、日本語も引き続き完全にサポートします。
独立した管理ページはそれぞれ大文字の `DESIGN.md` を持ち、ブログのデザインを継承しません。

## プロジェクト文書

依存関係の境界は [ARCHITECTURE.md](./ARCHITECTURE.md)、デプロイの仕様は
[GITHUB_PAGES.md](./GITHUB_PAGES.md)、承認済みの技術スタックと目標仕様は
[IMPLEMENTATION_SPEC.md](./IMPLEMENTATION_SPEC.md)、実装状況と開発者への引き継ぎは
[IMPLEMENTATION_STATUS.md](./IMPLEMENTATION_STATUS.md)、実装段階は
[DEVELOPMENT_PLAN.md](./DEVELOPMENT_PLAN.md)、操作と情報の流れは
[UX_FLOW.md](./UX_FLOW.md)、執筆ルールは [CONTENT_RULES.md](./CONTENT_RULES.md) を
参照してください。英語・韓国語・日本語の公開、検索対応、言語切り替え、記事リンクの
フォールバックについては [I18N.md](./I18N.md) に記載されています。

運用手順は [DEVELOPMENT.md](./DEVELOPMENT.md)、検索エンジン向けのルールは
[SEO.md](./SEO.md)、AI クローラーとエージェント向けのガイドは
[AI_DISCOVERY.md](./AI_DISCOVERY.md)、公開動作は [PUBLISHING.md](./PUBLISHING.md)、
リリースの受け入れ基準は [QUALITY_GATES.md](./QUALITY_GATES.md) にあります。
コンテンツ以外のプロジェクト変更は [History.md](./History.md) に記録します。

## AI 検索対応

検索エンジン向けのビルドは、AI クローラーを考慮した `robots.txt` と簡潔なルートの
`llms.txt` を生成します。公開され、インデックス可能なコンテンツについては、AI 検索、
ユーザーの指示による取得、モデル開発、公開データセットのクローラーを明示的に許可します。
設定と成果物の読み込み、決定論的な `robots.txt` と `llms.txt`、サイトマップ、言語別 RSS、
マニフェスト、ファイル出力は実装済みです。

クローラーのアクセスとガイドへの掲載は `config/ai-crawlers.yaml` だけで設定します。
生成されたファイルを手作業で編集してはいけません。`llms.txt` は任意の検索支援の提案であり、
認証やアクセス制御ではなく、正規の HTML やページ単位のメタデータの代わりにもなりません。

記事成果物の仕様では、原著作物について所有者が宣言する英語の来歴情報を一つ要求します。
最終的な静的レンダラーは、原著作物は人間が執筆し、その作業での AI 支援は校正に限定された
ことを、文書 head のカスタムメタデータとしてのみ出力します。設定、成果物の生成、最終
ページの head メタデータのレンダリングは実装済みです。

動作やポリシーの変更には、同じ作業内でテストの追加・更新が必要です。
[TESTING.md](./TESTING.md) は、正常系・異常系・境界・回帰テスト、ポリシーとテストの
追跡関係、フィクスチャ、例外、検証報告を定義します。影響の大きいポリシーは
`tests/policy-coverage.json` で具体的なテストケースに対応付けています。

## 任意の Clarity 分析

分析には Microsoft Clarity のみを使用します。GitHub リポジトリまたは
`github-pages` 環境に次の公開変数を設定すると有効になります。

```text
CLARITY_PROJECT_ID=yourprojectid
```

空なら追跡せず、不正な ID はビルドで拒否します。対象の本番ブログページで
両方の Cookie 保存目的を拒否した状態で、Cookie を使わない限定的な分析を
自動開始します。テキスト・入力値をマスクし、検索・プレビュー・管理ページを
除外します。折りたたまれた案内から収集を停止でき、以前の拒否設定も尊重します。
再訪問者の識別とページ間の移動分析は制限されます。
URL メタデータには提供者固有の制限があり、クエリ付きのアクセスは測定しません。
有効化前に[設定とプライバシーの境界](ANALYTICS.md)を確認してください。
