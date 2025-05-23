import { Group } from "@visx/group";
import { Text as VisxTtext } from "@visx/text";
import { ScaleSVG } from "@visx/responsive";
import {
  Box,
  Button,
  Divider,
  Flex,
  Progress,
  Stack,
  StackDivider,
  Text
} from "@chakra-ui/react";
import Layout from "../components/Layout";
import { QuizGraph } from "../components/main/QuizGraph";
import { RadarAxis, RadarMark } from "../components/main/RaderChart";
import { stepSelector, typeSelector, userState } from "../recoil";
import { LetterFrequency, TypeDescriptionType, User } from "../types";
import {
  AVERAGE,
  Kolb,
  RADAR_HEIGHT,
  RADAR_WIDTH,
  RADER_MARGIN,
  TypeDescriptionList
} from "../config";
import axios from "axios";
import { useRecoilValue } from "recoil";
import { useMutation } from "react-query";
import { useEffect, useState } from "react";
import { schemeTableau10 as COLOR } from "d3-scale-chromatic";
import { useRouter } from "next/router";
import PieChart from "../components/main/PieChart";

export default function MainPage() {
  const router = useRouter();
  const user = useRecoilValue<User | null>(userState);
  const type = useRecoilValue<TypeDescriptionType>(typeSelector);
  const step = useRecoilValue<string[]>(stepSelector);
  const [mbti, setMbti] = useState<string>("");
  const [kolb, setKolb] = useState<LetterFrequency[]>([]);
  const [rader, setRader] = useState<number[]>([]);
  const [totalUserProgress, setTotalProgress] = useState<number>(0);
  const [userProgress, setUserProgress] = useState<number>(0);
  const main = async () => {
    const { data } = await axios.post("/api/main", {
      token: user!.token
    });
    return data;
  };
  const { mutate } = useMutation(main, {
    onSuccess: (data) => {
      setMbti(data.mbti);
      var arr1 = [...data.kolbProba];
      data.kolbProba.forEach((value: number, index: number) => {
        arr1.push({
          letter: Kolb[index],
          frequency: value
        });
      });
      setKolb(arr1);
      var arr = [...data.rader];
      for (const v of data.rader) {
      }
      setRader(arr);
      setTotalProgress(data.totalUserProgress);
      setUserProgress(data.userProgress);
    },
    onError: (err) => {
      alert(err);
    }
  });
  useEffect(() => {
    mutate();
  }, []);

  return (
    <Layout>
      <Stack
        direction={"column"}
        w={{ base: "full", xl: "container.xl" }}
        spacing={5}
        mb="10"
      >
        <Stack direction="row" justifyContent="space-between" gap={5} pt={30}>
          <Flex
            bg="#F5F5F5"
            borderRadius="5px"
            boxShadow={"base"}
            fontWeight="bold"
            textAlign="center"
            direction={"column"}
            p={10}
            pt={30}
            pb={30}
            w="23%"
          >
            <Text fontSize={20} color="gray">
              Kolb 학습 유형
            </Text>
            <Text mt={2} fontSize={30}>
              {type?.type}
            </Text>
          </Flex>
          <Flex
            bg="#F5F5F5"
            borderRadius="5px"
            boxShadow={"base"}
            fontWeight="bold"
            textAlign={"center"}
            direction={"column"}
            w="23%"
            p={16}
            pt={30}
            pb={30}
          >
            <Text fontSize={20} color="gray">
              My MBTI
            </Text>
            <Text fontSize={35}>{mbti}</Text>
          </Flex>
          <Flex
            w="50%"
            bg="#F5F5F5"
            justifyContent="space-around"
            borderRadius="5px"
            boxShadow={"base"}
            fontWeight="bold"
            textAlign="center"
            direction={"row"}
            p={10}
            pt={30}
            pb={0}
          >
            <Flex direction={"column"} wordBreak="break-word">
              <Text fontSize={20} color="gray">
                추천 학습 콘텐츠
              </Text>
              <Text fontSize={30}>{type?.content}</Text>
            </Flex>
            <Divider orientation="vertical" ml={5} mr={5} />
            <Flex direction={"column"}>
              <Text fontSize={20} color="gray">
                강의 바로가기
              </Text>
              <Button
                mt={5}
                borderRadius={"5px"}
                colorScheme={"green"}
                variant="outline"
                borderWidth={"2px"}
                onClick={() => router.push("/course")}
                p={7}
                pt={5}
                pb={5}
                fontWeight={"bold"}
                fontSize={20}
              >
                {step[0]}
              </Button>
            </Flex>
          </Flex>
        </Stack>
        <Stack direction="row" justifyContent="space-between" gap={5}>
          <Flex
            borderRadius="5px"
            boxShadow={"base"}
            direction="column"
            p={5}
            pb={0}
          >
            <Text textAlign={"center"} fontSize="20" fontWeight={"bold"}>
              Kolb 유형 검사 결과
            </Text>
            <PieChart width={300} height={300} letters={kolb} />
          </Flex>
          <Flex
            borderRadius="5px"
            boxShadow={"base"}
            direction="column"
            w="100%"
            h="100%"
          >
            <Text textAlign={"center"} fontSize="20" fontWeight={"bold"} pt={5}>
              Kolb 유형 별 MBTI 평균
            </Text>
            <ScaleSVG width={RADAR_WIDTH} height={RADAR_HEIGHT}>
              <Group top={RADAR_HEIGHT / 2} left={RADAR_WIDTH / 2}>
                <RadarAxis
                  width={RADAR_WIDTH}
                  height={RADAR_HEIGHT}
                  margin={RADER_MARGIN}
                />

                {AVERAGE.map((average, i) => (
                  <>
                    <RadarMark
                      key={`mark${i}`}
                      data={average}
                      color={COLOR[i + 1]}
                      width={RADAR_WIDTH}
                      height={RADAR_HEIGHT}
                      margin={RADER_MARGIN}
                    />
                    <VisxTtext
                      key={`text${i}`}
                      x="80"
                      y={50 + 10 * i}
                      fontSize="8px"
                      fontWeight="bold"
                      fill={COLOR[i + 1]}
                    >
                      {`■ ${TypeDescriptionList[i].type}`}
                    </VisxTtext>
                  </>
                ))}
              </Group>
            </ScaleSVG>
          </Flex>
          <Flex
            borderRadius="5px"
            boxShadow={"base"}
            direction="column"
            h="100%"
            w="100%"
          >
            <Text textAlign={"center"} fontSize="20" fontWeight={"bold"} pt={5}>
              나의 MBTI와 비교
            </Text>
            <ScaleSVG width={RADAR_WIDTH} height={RADAR_HEIGHT}>
              <Group top={RADAR_HEIGHT / 2} left={RADAR_WIDTH / 2}>
                <RadarAxis
                  width={RADAR_WIDTH}
                  height={RADAR_HEIGHT}
                  margin={RADER_MARGIN}
                />
                <RadarMark
                  data={rader}
                  color={COLOR[0]}
                  width={RADAR_WIDTH}
                  height={RADAR_HEIGHT}
                  margin={RADER_MARGIN}
                />

                <RadarMark
                  key={`mark${2}`}
                  data={AVERAGE[user!.type - 1]}
                  color={COLOR[user!.type]}
                  width={RADAR_WIDTH}
                  height={RADAR_HEIGHT}
                  margin={RADER_MARGIN}
                />
                <VisxTtext
                  key={`text${2}`}
                  x="80"
                  y={50}
                  fontSize="8px"
                  fontWeight="bold"
                  fill={COLOR[user!.type]}
                >
                  {`■ ${TypeDescriptionList[user!.type - 1].type}`}
                </VisxTtext>
                <VisxTtext
                  x="80"
                  y={35}
                  fontWeight="bold"
                  fontSize="8px"
                  fill={COLOR[0]}
                >
                  ■ 나의 MBTI
                </VisxTtext>
              </Group>
            </ScaleSVG>
          </Flex>
        </Stack>
        <Stack
          borderRadius="5px"
          boxShadow={"base"}
          gap={10}
          direction="row"
          p={10}
          pt={5}
          pb={5}
          bg="#F5F5F5"
          divider={<StackDivider />}
        >
          <Stack w="100%">
            <Text fontWeight={"bold"} fontSize={20}>
              {type?.content} 학습자의 "{step[0]}" 평균 학습 진행률
            </Text>
            <Stack direction="row">
              <Progress
                mt={2}
                borderRadius={10}
                width="100%"
                size="lg"
                colorScheme="green"
                bg={"rgba(144, 187, 144,0.2)"}
                value={totalUserProgress}
              />
              <Text pl={5} fontWeight={"bold"} fontSize={18}>
                {totalUserProgress}%
              </Text>
            </Stack>
          </Stack>
          <Stack w="100%">
            <Text fontWeight={"bold"} fontSize={20}>
              나의 "{step[0]}" 현재 학습 진행률
            </Text>
            <Stack direction="row">
              <Progress
                mt={2}
                borderRadius={10}
                width="100%"
                size="lg"
                value={userProgress}
                colorScheme="green"
                bg={"rgba(144, 187, 144,0.2)"}
              />
              <Text pl={5} fontWeight={"bold"} fontSize={18}>
                {userProgress}%
              </Text>
            </Stack>
          </Stack>
        </Stack>
        {user!.type == 2 && <QuizGraph />}
      </Stack>
    </Layout>
  );
}
