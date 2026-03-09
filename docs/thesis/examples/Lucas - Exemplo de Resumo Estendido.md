## Page 1

# Football Intensive Data Extractor Goal Replay Analysis: Scoring Method and Play Classification

## Extended Abstract

Lucas Figueiredo Leitão  
lucas.figueiredo@tecnico.ulisboa.pt  

Instituto Superior Técnico, Universidade de Lisboa, Portugal  

November 14, 2025  

## Abstract

Football's global popularity has driven major technological advancements, yet automating detailed goal analysis remains a challenge. Inconsistent camera angles, diverse goal types, and frequent player occlusion complicate the accurate analysis of scoring events. This thesis introduces an AI-powered system that addresses these challenges by combining computer vision and machine learning techniques within a modular pipeline, enabling fine-grained annotation of goals using their replays. The system detects abrupt and gradual transitions, segments replays into individual shots, and filters irrelevant content. Relevant camera shots are then used to track the ball and players, identify touches, and apply pose estimation to determine the body part responsible for scoring. The system also classifies the type of play leading to each goal, distinguishing between open play and set pieces like corners, free kicks, and penalties. The system reduces reliance on manual analysis by offering a consistent and scalable solution, with insights that extend to coaching, player performance evaluation, and data-driven strategy development. Validation on a diverse set of goals showed high precision for shot and play classification, but identifying the body part responsible for scoring remained difficult, with low accuracy caused mainly by error propagation and visual complexity. Overall, the proposed system shows that automated football replay analysis can effectively support near real-time shot and play categorization, greatly reducing manual effort and enhancing consistency. Further improvements in ball tracking, pose estimation, and dataset diversity are required for reliable fine-grained goal annotation, paving the way for broader applications in broadcasting, tactical analysis, and data-driven strategy.

**Keywords:** AI-powered analysis, Computer Vision, Image Classification, Object Detection, Pose Estimation

## 1. Introduction

Sports video analysis has become an increasingly active research area, fueled by the growth of digital broadcasting and the demand for instant, data-driven insights [1–3]. Football, in particular, presents a compelling case: goals are decisive match events that attract intense viewer interest and provide valuable information for broadcasters, analysts, and fans. Automating goal analysis can accelerate highlight generation, enrich commentary, and offer structured insights for tactical and performance evaluation.

Despite significant progress in event detection and highlight generation [4], most existing approaches remain coarse-grained, identifying only whether a goal occurred. Broadcast replays introduce further challenges, including diverse camera views, occlusions, and replay sequences that obscure critical moments such as the exact scoring touch. As a result, current systems rarely provide detailed goal characterization, such as the body part used to score or the play type leading to the goal, which limits their analytical value.

In this work, we introduce a computer vision and machine learning pipeline for fine-grained goal analysis. Our system integrates modules for automatic shot¹ filtering, classification of play types (e.g., free kick, corner, penalty), object detection, touch detection, and touch classification with pose estimation to determine the scoring body part. This end-to-end approach enables structured descriptions of goals, going beyond simple detection to deliver richer contextual analysis.

Compared to prior research, our contribution

---
¹In this thesis, the term “shot” always refers to a camera shot.

---


## Page 2

lies in bridging coarse event recognition and detailed analytic understanding. By combining robust replay segmentation, play categorization, and body-part identification within a single framework, our method introduces a new level of granularity in football goals video analysis. This advancement, developed in a collaboration with Six Floor Solutions², offers both practical applicability and technical novelty for automated sports media processing.

## 2. Background

Here we present foundational works related to the four core components of this thesis: shot boundary detection, shot classification, play classification, and goal classification.

### 2.1. Shot Boundary Detection

Shot boundary detection, the task of identifying transitions between camera shots, is fundamental for sports video analysis, particularly in football, where it enables more precise tactical and performance evaluations. Football broadcasts commonly feature two transition types: abrupt hard cuts, marked by a single frame change, and gradual dissolves, where frames overlap during a fade [5].

Early methods compared pixel intensities [6] or histograms of consecutive frames [7]. While intuitive and somewhat robust against motion, these approaches were prone to false detections and often failed when distinct shots shared similar distributions. Feature-based methods, such as edge detection [8], wavelet and Hilbert transforms [9], or keypoint matching with SURF descriptors [10], added resilience to lighting and motion changes but still struggled with blur, low contrast, or high-motion scenes. Hybrid techniques combining multiple cues sought to balance these limitations by improving detection across diverse content [11].

More recently, deep learning has transformed shot boundary detection. Siamese CNNs have been used to learn frame similarity metrics [12], sometimes coupled with clustering for grouping. 3D convolutional networks extended this by capturing temporal dependencies [13], while models like TransNet [14] and its successor TransNetV2 [15] achieved state-of-the-art results through dilated 3D convolutions, optimizing both accuracy and scalability for large datasets.

In addition to general methods, football-specific approaches have emerged that exploit the sport’s visual patterns, such as the dominance of green-field regions and typical broadcast compositions [16], offering more tailored solutions to handle the fast dynamics and homogeneous backgrounds of soccer footage.

### 2.2. Shot Classification

Following shot boundary detection, the next step is shot classification, which helps isolate segments relevant to gameplay while filtering out contextual content such as celebrations, crowd reactions, or tactical replays. Typical categories include long field shots, medium shots focusing on smaller pitch areas, close-ups of players, and audience shots. This distinction ensures the system can emphasize actual game sequences over auxiliary footage.

Early approaches relied on spatial features, where methods such as those by Ekin *et al.* [17] classified shots based on field detection, leveraging the presence and extent of grass to separate gameplay views from close-ups. Building on this, Zhou *et al.* [18] applied support vector machines trained with low-level features like color distributions, edges, and shot duration to distinguish between long, medium, and close-up shots. Color-based strategies further improved discrimination [19]: by analyzing the proportion of specific pitch-colored pixels, algorithms could effectively identify field-level shots. To separate visually similar categories such as close-ups and crowd footage, edge density was often used, since audience shots tend to exhibit greater texture variation.

More advanced multi-feature systems integrated cues such as color ratios, blob area measurements, and edge information for robust classification across camera types [16]. Recently, deep learning has further refined this task, with neural networks trained to categorize frame-level shots into coarse but informative types such as long, medium, or close views, thereby enabling richer indexing and event analysis [20].

This progression illustrates a shift from simple, rule- or feature-based techniques toward multi-modal and deep learning approaches. However, the visual complexity of football, characterized by dynamic camera angles, lighting changes, and rapid scene changes, requires specialized adaptations to accurately classify the type of shot.

### 2.3. Play Classification

Although this work focuses specifically on goal scenarios, most play classification research addresses entire matches. In goal replays, the first camera shot often provides a wide, uninterrupted view of the buildup play, capturing player positioning and ball movement leading to the scoring opportunity. This consistent structure makes goal replays particularly suitable for analyzing different types of scoring sequences, such as long buildups or set pieces like free kicks, corners, and penalties.

Early work in play classification followed rule-based approaches that relied on contextual cues. For example, systems used ball and field

---
²A tech company dedicated to revolutionizing the media consumption experience: www.sixfloorsolutions.com

&lt;page_number&gt;2&lt;/page_number&gt;

---


## Page 3

detection to distinguish set-piece types based on spatial relationships between the ball, players, and pitch markings [21]. More recent rule-driven methods extended this logic to tracking data, where rules about player formations and positions enabled reliable identification of kick-offs, penalties, corners, and goal kicks without requiring ball flight information [22].

To move beyond handcrafted rules, feature-based supervised learning introduced a more systematic framework. These methods extracted low-level cues such as motion vectors, textures, and shot boundaries from video streams, which were then combined with information about spatial segmentation and camera motion to derive higher-level semantic features [23]. These features were fed into classifiers to assign play categories, supporting a richer mapping between raw video data and tactical events.

In the last few years, deep learning has driven major advances in play classification. Architectures combining generative models such as VAEs with CNN classifiers have been used to filter irrelevant frames and robustly assign plays to categories, including set pieces, tackles, and substitutions [4]. State-of-the-art image models like EfficientNet [24] and YOLO [25] have further expanded event recognition, enabling either frame-level classification or object-based detection for fine-grained analysis. These developments, along with transfer-learning tools, have made deep learning pipelines increasingly accessible and adaptable to football video analysis [26].

While most existing methods have been designed for full-match analysis, goal replays introduce unique challenges and opportunities. Broadcast replays may omit contextual buildup, yet they typically follow structured shot sequences that balance wide tactical views with detailed close-ups. This makes them well-suited for tailored event classification methods, offering valuable insights into scoring plays and practical applications for scouting, coaching, and fan engagement.

### 2.4. Goal Classification

Understanding how goals are scored, whether with the left foot, right foot, or head, provides valuable insights into both player abilities and team strategies. Recent advances in computer vision, object detection, and pose estimation now make it possible to track players and the ball automatically, identify contact moments, and attribute the decisive action to the correct body part.

A first step is the reliable detection and tracking of players and the ball. Modern object detection models such as YOLO offer high accuracy and speed, making them well-suited for real-time football analysis. For instance, frameworks like those developed by Jurca *et al.* [27] combine YOLO-based detection with multi-object tracking to follow players and region-based methods such as CSRT to handle the ball’s small size and erratic motion. This distinction between player and ball tracking remains essential, as their visual and motion characteristics differ significantly.

Once players are detected, pose estimation enables the identification of the body parts involved in ball contact. Two main paradigms exist: top-down approaches estimate keypoints per detected individual, while bottom-up methods detect all joints first and cluster them into poses. Models like YOLO-Pose integrate detection and keypoint prediction in a single step [28], facilitating real-time analysis, while established systems like OpenPose remain robust in crowded or occluded football scenes [29]. These advances provide the foundation for classifying how a goal is executed.

Beyond raw pose detection, recent research has explored posture and biomechanics. Work such as AutoSoccerPose [30], using dedicated datasets, demonstrates how sequences of 2D and 3D joint positions can be analyzed with graph-based neural networks to differentiate shot styles, such as instep or inside-foot strikes, based on biomechanical parameters. This approach shows the potential of pose-based methods for interpretable performance analysis, bridging biomechanics with computer vision.

Finally, action-focused systems integrate spatio-temporal pose data with ball trajectories to attribute decisive actions precisely. By combining skeletal joint tracking with ball movement, models can automatically determine both the shooter and the body part used at the moment of contact [31]. Validations on professional matches, including World Cup finals, have demonstrated near-human accuracy in identifying shots and their execution methods, confirming the practical potential of these systems.

Together, these developments show how detection, pose estimation, and action analysis can transform goal classification into a fine-grained, automated process, capable of supporting detailed player evaluation, tactical breakdowns, and applications across professional analysis and fan engagement.

## 3. Methodology

The presented architecture for goal replay analysis in soccer broadcasts follows a three-stage process: shot detection and classification, play classification, and goal classification, see Figure 1.

### 3.1. Shot Detection and Classification

The system first detects the shot intervals within the broadcast video using the TransNetV2 [15], seg-

&lt;page_number&gt;3&lt;/page_number&gt;

---


## Page 4

mermaid
graph TD
    A[Goal Replay Video] --> B[Shot Detector and Classifier]
    A --> C[Play Classifier]
    A --> D[Goal Classifier]

    B --> E[Shot Boundary Detector]
    B --> F[Shot Classifier and Filter]

    C --> G[Play Classification]
    C --> H[Is Long Play?]

    D --> I[Player and Ball Detector]
    D --> J[Touch Detector]

    E --> K[Shot Intervals]
    F --> L[Long and Medium Shots Intervals]
    G --> M[Play Type]
    H -- Yes --> N[First Shot Interval]
    H -- No --> O[Play Classification and Confidence]
    I --> P[Player and Ball Bounding Boxes]
    J --> Q[Touch Occurrence Frames]
    Q --> R[Touch Analyzer]
    R --> S[Goal Classification and Confidence]

    style A fill:#fff,stroke:#333,stroke-width:2px
    style B fill:#fff,stroke:#333,stroke-width:2px
    style C fill:#fff,stroke:#333,stroke-width:2px
    style D fill:#fff,stroke:#333,stroke-width:2px
    style E fill:#fff,stroke:#333,stroke-width:2px
    style F fill:#fff,stroke:#333,stroke-width:2px
    style G fill:#fff,stroke:#333,stroke-width:2px
    style H fill:#fff,stroke:#333,stroke-width:2px
    style I fill:#fff,stroke:#333,stroke-width:2px
    style J fill:#fff,stroke:#333,stroke-width:2px
    style K fill:#fff,stroke:#333,stroke-width:2px
    style L fill:#fff,stroke:#333,stroke-width:2px
    style M fill:#fff,stroke:#333,stroke-width:2px
    style N fill:#fff,stroke:#333,stroke-width:2px
    style O fill:#fff,stroke:#333,stroke-width:2px
    style P fill:#fff,stroke:#333,stroke-width:2px
    style Q fill:#fff,stroke:#333,stroke-width:2px
    style R fill:#fff,stroke:#333,stroke-width:2px
    style S fill:#fff,stroke:#333,stroke-width:2px
```

Figure 1: Solution architecture illustrating its main components: shot detector and classifier, play classifier, and goal classifier, along with their interactions.

menting it by different camera shots. Afterwards, we utilize our custom image classification model, which was trained on approximately 740 images sourced from goals scored in 60 different soccer matches (made available by Six Floor Solutions), to categorize the shot into three distinct classes: long, medium, and other (the latter encompassing audience and close-up shots). To enhance our dataset, we applied various augmentations, including adjustments to saturation, brightness, gamma, and hue, as well as horizontal flips and slight rotations, which expanded our dataset to approximately 2,800 images.

With those augmented images, and with the objective to maximize the model’s reliability given the limited dataset size, we subsequently adopted a k-fold cross-validation training strategy, achieving a robust performance, with most residual errors occurring between visually ambiguous cases. Finally, only long and medium shots are retained for further analysis since only they capture the field view relevant for goal events. This filtering step ensures irrelevant close-up, audience shots, or unrelated shots are excluded, see Figure 2.

**3.2. Play Classification**

The play classification component takes the initial frame of the first long or medium shot to clas-

&lt;img&gt;Figure 2: Detection of shot boundaries using TransNetV2 [15], followed by classification with a custom image classification model and filtering based on the classification results.&lt;/img&gt;

---


## Page 5

sify the type of play leading to the goal. A sep-
arate image classification model classifies the play
into one of four categories: long play, corner, free
kick, or penalty, shown in Figure 3. The train-
ing dataset used, comprised 495 images prior to
augmentation, with 40% sourced from a Kaggle
dataset³, that underwent a manual filtering process
to select good quality images from relevant plays
suitable for play classification, while the remaining
60% of the dataset consisted of goal replay frames
extracted from the same goals from the 60 matches
used in the Section 3.1. After applying the same
augmentations used previously in the shot classifi-
cation (Section 3.1), the dataset was expanded to
approximately 2,000 images. Similar to the previ-
ous training, we also employed cross-validation dur-
ing training to maximize model reliability, achieving
a good performance in classifying play types that
led up to goals.

Finally, to minimize misclassifications, we imple-
mented a verification step that assesses whether the
initial shot captures the actual goal event or a pre-
ceding occurrence, such as a foul. If the first shot
is ambiguous, the system examines the second shot
and relies on its classification to determine the cor-
rect play type. This step helps correctly identify
the origin context of the goal in replays where the
first shot might be misleading.

views, the ball and players are much smaller, mak-
ing them harder to detect, particularly the ball. To
tackle this issue, we explored an open-source repos-
itory that offered a pre-trained model specifically
fine-tuned for soccer⁴. This model demonstrated
a greater ability to detect the ball from distant
camera angles and could occasionally differentiate
between players, goalkeepers, and referees. How-
ever, its classification of individuals was inconsis-
tent, leading us to utilize the model solely for ball
detection in long shots while continuing to employ
YOLOv11 for medium shots.

Despite achieving improved ball detection re-
sults, we still encountered instances of false detec-
tions. Even after employing tracking algorithms
like BoT-SORT and ByteTrack, the outcomes re-
mained unsatisfactory. To resolve these issues, we
developed our own tracking logic. The algorithm
started by detecting candidate ball bounding boxes
in a camera shot, connecting detections of the same
object based on proximity, similar size, and color.
Treating these smaller ball trajectories as graph
nodes, we constructed a directed graph where edges
represent plausible temporal connections between
these nodes.

An edge from one node to another was allowed
only if the first node’s detections occurred before
those of the second, respecting temporal order.
Each edge was assigned a weight designed to encour-
age paths with characteristics reflecting true ball
movement. The weighting favored nodes with many
detections (reducing the impact of isolated false
positives), temporally close nodes (assuming the
ball is the most consistently detected object amid
false positives), and nodes located within player
bounding boxes that showed the ball leaving con-
tact (to exclude detections corresponding to gloves
or boots).

It also encouraged connections between nodes
with similar bounding box sizes and physically close
detections where the end of one path was near the
start of the next. The algorithm then selected
the most probable path through this graph that
maximized the number of correct ball detections.
Missing detections between linked bounding boxes
were interpolated using simple linear interpolation.
While not perfectly accurate, the linear interpola-
tion method was chosen due to time constraints
and overall proved sufficient without significantly
degrading final tracking results. Figure 4 displays
a frame extracted from the algorithm, featuring vi-
sual lines and boxes that represent the object de-
tection and tracking decisions.

Using the relative movement between the ball
and players’ bounding boxes, the system detects

---

³https://www.kaggle.com/datasets/rishintiw/
soccer-event-classification-image-data-cnn-and-llm

⁴https://github.com/Mostafa-Nafie/
Football-Object-Detection

&lt;img&gt;Long Play&lt;/img&gt;
&lt;img&gt;Corner&lt;/img&gt;
&lt;img&gt;Free Kick&lt;/img&gt;
&lt;img&gt;Penalty&lt;/img&gt;

Figure 3: Examples of images selected for training
the play classification model, along with their pre-
dicted classes.

### 3.3. Goal Classification

The goal classification first step is to detect play-
ers and the ball in the retained medium and long
shots, see Figure 1, since the rest of the analysis
depends on these detections. We initially employed
YOLOv11 for object detection. While YOLOv11
performed well in medium shots, where players and
the ball appear larger and closer to the camera,
it struggled in long shots. In these wide-angle

&lt;page_number&gt;5&lt;/page_number&gt;

---


## Page 6

&lt;img&gt;Figure 4: Player detection (indicated by green boxes) and ball tracking (represented by the green line), along with the selection of the correct ball trajectory, shown as the black line within the green line.&lt;/img&gt;

“touches”, moments when a player interacts with the ball, by analyzing factors such as speed and angle of ball movement relative to each player, as illustrated in Figure 5.

&lt;img&gt;Figure 5: Touch detection followed by pose estimation in a region cropped around the ball, with the objective of identifying the body part responsible for the goal, (need to be close to the ball at the touch moment).&lt;/img&gt;

For each detected touch, starting with the last detected touch before the goal (usually the scoring action), the classifier extracts three frames: before, during, and after the touch, cropped around the ball. These frames are analyzed using keypoints detected by the YOLO pose estimation model to identify the keypoint most likely responsible for the touch. Based on these keypoints, as exemplified in Figure 5, the system classifies the body part used to score the goal, focusing on main parts like the right foot, left foot, or head. Confidence scores are calculated from all shots and combined using custom logic to produce a more precise goal classification. The complete goal classification process is summarized in Figure 6. The subcomponents and procedures illustrated in Figure 6 can be summarized and explained as follows:

<mermaid>
graph TD
    subgraph Goal Classifier
        A[Goal Replay Video] --> B[Player and Ball Detector]
        B --> C[Player and Ball Bounding Boxes]
        C --> D[Touch Detector]
        D --> E[Touch Occurrence Frames]
        E --> F[Touch Analyzer]
        F --> G[Goal Classification and Confidence]
    end

    subgraph For each camera shot:
        A --- B
        B --- C
        C --- D
        D --- E
        E --- F
        F --- G
    end
</mermaid>

Figure 6: Detailed logic of the goal classifier component.

&lt;page_number&gt;6&lt;/page_number&gt;

---


## Page 7

(2) Touches are detected by analyzing the movement of the ball in relation to each player’s bounding box in the frame, focusing on variations in speed and angle.

(3) Touches are analyzed in reverse order, as the last touch typically determines the scoring action. From that touch, the frame corresponding to the touch, along with the frames from the pre-touch and post-touch moments, is extracted and cropped around the ball. Next, a pose estimation model is applied to analyze the player’s movement using keypoints. This analysis identifies the body part responsible for scoring the goal by employing a decision tree based on the extracted player pose, movement features, and ball movement.

(4) The keypoints detected from each camera shot are then analyzed using a decision tree to determine if the results from each shot are similar. A conclusive outcome is assigned only if there is strong consensus across these shots, for example, when the same keypoint is consistently identified as the scoring body part in the majority of shots, and alternate keypoints receive consistently low confidence scores. If these criteria are not met, the goal classification is considered inconclusive. This aggregation strategy enhances robustness and minimizes the risk of a wrong classification resulting from ambiguous or inconsistent frames.

4. Results

The system was evaluated using 86 football goal replays collected from 24 professional matches across various leagues and broadcasters. We named this dataset *goals_dataset86*, and it included top European and international competitions, such as the UEFA Champions League, UEFA Europa League, Saudi Pro League, and Taça de Portugal, featuring samples from both men’s and women’s games. The video material was sourced from prominent sports broadcasters and streaming platforms, including BenficaTV, SportTV1, and DAZN. This diverse collection encompassed a range of replay conditions, incorporating different commentary styles, production standards, and camera angles, thereby providing a comprehensive evaluation across varied scenarios.

While the play classification analysis proved relatively fast and produced promising results, the time-consuming nature of shot and goal classification, combined with the repeated errors that occurred on those components, led us to adjust the dataset used. Instead of analyzing goals from a portion of the dataset in strict chronological order (by its game ID) from the oldest to the most recent matches, we aimed to increase the diversity of scenarios under study. To achieve this, 24 additional goals were added to the initial 21 that had already been analyzed in chronological order, resulting in a total of 45 goals drawn from 12 different games. We named this subset of the *goals_dataset86* as *goals_dataset45*.

The results were obtained using on a machine made available by Six Floor Solutions, featuring an Intel® Xeon® Gold 6132 CPU (2.60 GHz, 14 cores), an NVIDIA Tesla P40 GPU (24 GB), and 377 GB of RAM.

4.1. Shot Classification

The shot classifier achieved high precision across classes (distributed as detailed in Table 1), reaching 95% for *Long*, 89% for *Medium*, and 86% for *Other* shots, with an overall average of 90%, as shown in Figure 7. This capability is crucial for filtering out irrelevant footage (e.g., crowd or bench reactions) and retaining only the camera views needed for subsequent analysis.

Table 1: Distribution of different types of shots of the *goals_dataset45*.

<table>
<thead>
<tr>
<th>Type of shot</th>
<th>Quantity</th>
</tr>
</thead>
<tbody>
<tr>
<td>Long</td>
<td>59</td>
</tr>
<tr>
<td>Medium</td>
<td>107</td>
</tr>
<tr>
<td>Other</td>
<td>119</td>
</tr>
</tbody>
</table>

&lt;img&gt;Confusion matrix of the shot classifier component results on the *goals_dataset45*. The matrix shows three classes: Long, Medium, and Other. Each row represents the actual class, and each column represents the predicted class. The diagonal elements represent correct classifications, while off-diagonal elements represent misclassifications. The values are probabilities.&lt;/img&gt;
Figure 7: Confusion matrix of the shot classifier component results on the *goals_dataset45*.

4.2. Play Classification

The play classifier performed strongly, with an overall precision of 91%, in a dataset distributed as detailed in Table 2. *long plays* (93%), *corners* (100%), and *penalties* (86%) were well recognized, while *free kicks* (66%) remained harder to classify, illustrated

&lt;page_number&gt;7&lt;/page_number&gt;

---


## Page 8

in Figure 8, primarily due to the variability in their locations on the field and the different perspectives from which they are shown.

Table 2: Distribution of different types of plays of the *goals_dataset86*.

<table>
<thead>
<tr>
<th>Type of play</th>
<th>Quantity</th>
</tr>
</thead>
<tbody>
<tr>
<td>Long Play</td>
<td>66</td>
</tr>
<tr>
<td>Free Kick</td>
<td>6</td>
</tr>
<tr>
<td>Penalty</td>
<td>7</td>
</tr>
<tr>
<td>Corner</td>
<td>7</td>
</tr>
</tbody>
</table>

&lt;img&gt;Confusion matrix of the play classifier component results on the *goals_dataset86*. The matrix shows four rows (Actual) corresponding to Long Play, Free Kick, Corner Kick, and Penalty Kick, and four columns (Predicted) also corresponding to Long Play, Free Kick, Corner Kick, and Penalty Kick. The values within the cells represent the probability of each type of play being classified as another type. For example, the cell at the intersection of "Long Play" (Actual) and "Long Play" (Predicted) has a value of 0.93, indicating that 93% of actual Long Plays were correctly predicted as Long Plays. The cell at the intersection of "Free Kick" (Actual) and "Corner Kick" (Predicted) has a value of 0.17, indicating that 17% of actual Free Kicks were incorrectly predicted as Corner Kicks. The color bar on the right indicates the scale of these probabilities, ranging from 0 to 1.&lt;/img&gt;
Figure 8: Confusion matrix of the play classifier component results on the *goals_dataset86*.

### 4.3. Goal Classification

In contrast, the goal classification module achieved only 17% precision, reflecting its dependence on accurate upstream modules. Errors stemmed from unreliable ball detection, occlusions, sensitivity to slow-motion replays, and pose estimation challenges in blurred or obstructed frames. Mislabeling of body parts (e.g., swapping head and shoulder, or hands and feet) was frequent, while fixed crop windows often failed to capture completely the touch and the player responsible for it. These factors collectively limited robustness.

### 4.4. System Performance

Processing replays required on average 3.2 times their duration, with goal classification as the most computationally demanding component (approximately 4 seconds of computation per second of Long or Medium shot). In comparison, shot detection/classification and play classification were substantially faster, supporting real-time use when run independently of goal classification.

### 5. Discussion

Overall, the results obtained highlight the viability of modular replay analysis, with strong performance for play and shot classification, enabling reliable filtering and categorization in real-time. The main bottleneck lies in goal classification, where weaknesses in upstream modules propagate into poor accuracy.

#### 5.1. Limitations

The goal classification component, responsible for identifying the scoring body part, remains a significant challenge, achieving low precision due to upstream modules such as ball detection, trajectory reconstruction, and pose estimation. This issue underscores the necessity for more robust visual tracking, adaptive methods for slow-motion content, and improved pose estimation strategies, all aimed at enabling comprehensive fine-grained goal analysis. Despite current limitations, the system demonstrates potential to enhance broadcast coverage and tactical analysis by enriching how goals are automatically described.

### 6. Conclusions

This work presented an automated pipeline for football goal analysis by combining shot detection and classification, play classification, and goal classification. The system achieved strong performance in both play and shot classification, with accuracies above 85%, enabling reliable filtering and categorization of plays at real-time speeds. These results demonstrate the feasibility of structured, automated football replay analysis, a task typically requiring manual effort.

#### 6.1. Future Work

Future work will focus on enhancing ball detection, introducing context-aware cropping for pose estimation, refining thresholds for touch detection, and moving towards streaming-compatible architectures. Expanding the diversity of the dataset, particularly with underrepresented play types, such as free kicks, will further improve the system’s robustness and generalization.

### References

[1] Zhiqiang Pu, Yi Pan, Shijie Wang, Boyin Liu, Min Chen, Hao Ma, and Yixiong Cui. Orientation and decision-making for soccer based on sports analytics and ai: A systematic review. *IEEE/CAA Journal of Automatica Sinica*, 11(1):37–57, 2024.

[2] Keshav Rathi, Priyam Somani, Aditya V Koul, and KS Manu. Applications of artificial intelligence in the game of football: The global perspective. *Researchers World*, 11(2):18–29, 2020.

&lt;page_number&gt;8&lt;/page_number&gt;

---


## Page 9

[3] Joaquín González Rodenas, Rodrigo Aranda Malavés, Andrés Tudela Desantes, Enrique Sanz Ramírez, Josep Crespo Hervás, and Rafael Aranda Malavés. Past, present and future of goal scoring analysis in professional soccer. *Retos: nuevas tendencias en educación física, deporte y recreación*, (37):774–785, 2020.

[4] Ali Karimi, Ramin Toosi, and Mohammad Ali Akhaee. Soccer event detection using deep learning. *arXiv preprint arXiv:2102.04331*, 2021.

[5] Tejaswini Kar, Priyadarshi Kanungo, Sachi Nandan Mohanty, Sven Groppe, and Jinghua Groppe. Video shot-boundary detection: issues, challenges and solutions. *Artificial Intelligence Review*, 57(4):104, 2024.

[6] HongJiang Zhang, Atreyi Kankanhalli, and Stephen W Smoliar. Automatic partitioning of full-motion video. *Multimedia systems*, 1(1):10–28, 1993.

[7] Kiyotaka Otsuji and Yoshinobu Tonomura. Projection detecting filter for video cut detection. In *Proceedings of the First ACM International Conference on Multimedia*, pages 251–257, 1993.

[8] Ramin Zabih, Justin Miller, and Kevin Mai. A feature-based algorithm for detecting and classifying scene breaks. In *Proceedings of the Third ACM International Conference on Multimedia*, pages 189–200, 1995.

[9] T Kar and P Kanungo. Video shot boundary detection based on hilbert and wavelet transform. In *2017 2nd International Conference on Man and Machine Interfacing*, pages 1–6. IEEE, 2017.

[10] Murat Birinci and Serkan Kiranyaz. A perceptual scheme for fully automatic video shot boundary detection. *Signal Processing: Image Communication*, 29(3):410–423, 2014.

[11] Bose Lungisani, Edwin Thuma, and Gabofetswe Malema. A classification approach to video shot boundary detection. *International Journal of Signal Processing, Image Processing and Pattern Recognition*, 10(12):103–118, 2017.

[12] Lorenzo Baraldi, Costantino Grana, and Rita Cucchiara. Shot and scene detection via hierarchical clustering for re-using broadcast video. In *International Conference on Computer Analysis of Images and Patterns*, pages 801–811. Springer, 2015.

[13] Michael Gygli. Ridiculously fast shot boundary detection with fully convolutional neural networks. In *2018 International Conference on Content-based Multimedia Indexing*, pages 1–4. IEEE, 2018.

[14] Tomáš Souček, Jaroslav Moravec, and Jakub Lokoč. Transnet: A deep network for fast detection of common shot transitions. *arXiv preprint arXiv:1906.03363*, 2019.

[15] Tomás Soucek and Jakub Lokoc. Transnet v2: An effective deep network architecture for fast shot transition detection. In *Proceedings of the 32nd ACM International Conference on Multimedia*, pages 11218–11221, 2024.

[16] Farshad Bayat, Mohammad Shahram Moin, and Farhad Bayat. Goal detection in soccer video: Role-based events detection approach. *International Journal of Electrical and Computer Engineering*, 4(6):979, 2014.

[17] Ahmet Ekin, A Murat Tekalp, and Rajiv Mehrotra. Automatic soccer video analysis and summarization. *IEEE Transactions on Image Processing*, 12(7):796–807, 2003.

[18] Yi-Hua Zhou, Yuan-Da Cao, Long-Fei Zhang, and Hong-Xin Zhang. An svm-based soccer video shot classification. In *2005 International Conference on Machine Learning and Cybernetics*, volume 9, pages 5398–5403. IEEE, 2005.

[19] Tian Fang and Shi Ping. Attractive events detection in soccer videos based on identification of shots. In *3rd International Conference on Multimedia Technology*, pages 807–815. Atlantis Press, 2013.

[20] Mehdi Houshmand Sarkhoosh, Sushant Gautam, Cise Midoglu, Saeed Shafiee Sabet, and Pål Halvorsen. Multimodal AI-based summarization and storytelling for soccer on social media. In *Proceedings of the 15th ACM Multimedia Systems Conference*, pages 485–491, 2024.

[21] Ying Li, Guizhong Liu, and Xueming Qian. Ball and field line detection for placed kick refinement. In *2009 WRI Global Congress on Intelligent Systems*, volume 4, pages 404–407. IEEE, 2009.

[22] Ferran Vidal-Codina, Nicolas Evans, Bahaeddine El Fakir, and Johsan Billingham. Automatic event detection in football using tracking data. *Sports Engineering*, 25(1):18, 2022.

[23] Ling-Yu Duan, Min Xu, Xiao-Dong Yu, and Qi Tian. A unified framework for semantic shot

&lt;page_number&gt;9&lt;/page_number&gt;

---


## Page 10

classification in sports videos. In *Proceedings of the Tenth ACM International Conference on Multimedia*, pages 419–420, 2002.

[24] Mingxing Tan and Quoc Le. Efficientnet: Rethinking model scaling for convolutional neural networks. In *International Conference on Machine Learning*, pages 6105–6114. PMLR, 2019.

[25] Nidhal Jegham, Chan Young Koh, Marwan Abdelatti, and Abdeltawab Hendawi. Evaluating the Evolution of YOLO (You Only Look Once) Models: A Comprehensive Benchmark Study of YOLO11 and Its Predecessors. *arXiv preprint arXiv:2411.00201*, 2024.

[26] Nidhal Jegham, Chan Young Koh, Marwan Abdelatti, and Abdeltawab Hendawi. Yolo evolution: A comprehensive benchmark and architectural review of YOLOv12, YOLO11, and their previous versions. *arXiv preprint arXiv:2411.00201*, 2024.

[27] Mihnea Bogdan Jurca and Ion Giosan. A modern approach for positional football analysis using computer vision. In *2022 IEEE 18th International Conference on Intelligent Computer Communication and Processing*, pages 275–282. IEEE, 2022.

[28] Debapriya Maji, Soyeb Nagori, Manu Mathew, and Deepak Poddar. YOLO-Pose: Enhancing yolo for multi person pose estimation using object keypoint similarity loss. In *Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition*, pages 2637–2646, 2022.

[29] Zhe Cao, Gines Hidalgo, Tomas Simon, Shih-En Wei, and Yaser Sheikh. Openpose: Realtime multi-person 2D pose estimation using part affinity fields. *IEEE Transactions on Pattern Analysis and Machine Intelligence*, 43(1): 172–186, 2019.

[30] Calvin Yeung, Kenjiro Ide, and Keisuke Fujii. Autosoccerpose: Automated 3D posture analysis of soccer shot movements. In *Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition*, pages 3214–3224, 2024.

[31] George C Bian. *Soccer Last Touch and Automatic Event Detection with Skeletal Tracking Data*. PhD thesis, Massachusetts Institute of Technology, 2024.

&lt;page_number&gt;10&lt;/page_number&gt;